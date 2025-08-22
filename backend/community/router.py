from typing import List
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from auth.deps import get_current_user, get_admin_user
from auth.schemas import UserInfo
from database import get_db
from storage.minio_service import MinioService

from .models import Thread, Like, Repost, User as CommunityUser, Hashtag, ThreadHashtag
from .schemas import (
    UserCreate,
    UserOut,
    ThreadCreate,
    ThreadOut,
    ThreadWithAuthorOut,
    ProfileOut,
    ReplyCreate,
    ThreadDetailOut,
    ActionOut,
    PresignedUrlRequest,
    PresignedUrlResponse,
    AttachMediaRequest,
    MediaItemOut,
    AuthorMini,
)
from .services.community_service import CommunityService

router = APIRouter(
	tags=["OneTee Community"],
)

minio_service = MinioService()
service = CommunityService()

# Threads
@router.post("/threads", response_model=ThreadOut)
def create_thread(payload: ThreadCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
	# Enforce daily thread limit for non-verified users (top-level threads only)
	from datetime import datetime, timedelta
	if not payload.in_reply_to_id and not user.is_verified:
		start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
		end = start + timedelta(days=1)
		from sqlalchemy import select, func
		count = db.execute(
			select(func.count(Thread.id)).where(
				Thread.author_id == user.id,
				Thread.created_at >= start,
				Thread.created_at < end,
				Thread.in_reply_to_id.is_(None),
			)
		).scalar_one() or 0
		if count >= 5:
			raise HTTPException(status_code=429, detail="Daily limit reached. Get verified to thread more.")
	if not payload.content or not payload.content.strip():
		raise HTTPException(status_code=400, detail="Content required")
	thread = service.create_thread(
		db,
		author_id=user.id,
		content=payload.content,
		in_reply_to_id=payload.in_reply_to_id,
	)
	if payload.media_keys:
		for key in payload.media_keys:
			service.attach_media_to_thread(db, thread_id=thread.id, object_key=key, media_type="image", alt_text=None)
		db.refresh(thread)
	return thread


# Social actions
@router.post("/threads/{thread_id}/like", response_model=ActionOut)
def like_thread(thread_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
	service.like_thread(db, user_id=user.id, thread_id=thread_id)
	return {"success": True}


@router.get("/threads", response_model=list[ThreadWithAuthorOut])
def list_threads(limit: int = 50, offset: int = 0, tag: str | None = None, db: Session = Depends(get_db)):
	# newest first with engagement counts
	from sqlalchemy import select, func
	from sqlalchemy.orm import joinedload
	likes_sq = (
		select(Like.thread_id, func.count(Like.id).label("likes")).group_by(Like.thread_id).subquery()
	)
	reposts_sq = (
		select(Repost.thread_id, func.count(Repost.id).label("reposts")).group_by(Repost.thread_id).subquery()
	)
	replies_sq = (
		select(Thread.in_reply_to_id.label("thread_id"), func.count(Thread.id).label("replies")).where(Thread.in_reply_to_id.is_not(None)).group_by(Thread.in_reply_to_id).subquery()
	)
	stmt = (
		select(Thread, func.coalesce(likes_sq.c.likes, 0), func.coalesce(reposts_sq.c.reposts, 0), func.coalesce(replies_sq.c.replies, 0))
		.options(joinedload(Thread.author), joinedload(Thread.media_items))
		.outerjoin(likes_sq, Thread.id == likes_sq.c.thread_id)
		.outerjoin(reposts_sq, Thread.id == reposts_sq.c.thread_id)
		.outerjoin(replies_sq, Thread.id == replies_sq.c.thread_id)
	)
	if tag:

		tag_sq = select(ThreadHashtag.thread_id).join(Hashtag, Hashtag.id == ThreadHashtag.hashtag_id).where(Hashtag.tag == tag).subquery()
		stmt = stmt.where(Thread.id.in_(tag_sq))
	stmt = stmt.order_by(Thread.created_at.desc()).offset(offset).limit(limit)
	rows = db.execute(stmt).unique().all()
	result: list[dict] = []
	for thread, likes, reposts, replies in rows:
		mi = [
			{"id": m.id, "url": m.url, "media_type": getattr(m, "media_type", "image"), "alt_text": getattr(m, "alt_text", None)}
			for m in getattr(thread, "media_items", [])
		]
		result.append(
			{
				"id": thread.id,
				"author_id": thread.author_id,
				"content": thread.content,
				"in_reply_to_id": thread.in_reply_to_id,
				"created_at": thread.created_at,
				"updated_at": thread.updated_at,
				"media_items": mi,
				"author": {
					"id": thread.author.id if thread.author else None,
					"username": thread.author.username if thread.author else None,
					"display_name": thread.author.display_name if thread.author else None,
					"avatar_url": thread.author.avatar_url if thread.author else None,
				},
				"likes": int(likes or 0),
				"reposts": int(reposts or 0),
				"replies": int(replies or 0),
			}
		)
	return result


@router.post("/threads/{thread_id}/repost", response_model=ActionOut)
def repost_thread(thread_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
	service.repost_thread(db, user_id=user.id, thread_id=thread_id)
	return {"success": True}


@router.post("/threads/{thread_id}/bookmark", response_model=ActionOut)
def bookmark_thread(thread_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
	service.bookmark_thread(db, user_id=user.id, thread_id=thread_id)
	return {"success": True}


@router.delete("/threads/{thread_id}", response_model=ActionOut)
def delete_own_thread(thread_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
	from sqlalchemy import delete
	thread = db.get(Thread, thread_id)
	if not thread:
		raise HTTPException(status_code=404, detail="Not found")
	if thread.author_id != user.id:
		raise HTTPException(status_code=403, detail="Not allowed")
	# Cascades remove related rows
	db.execute(delete(Thread).where(Thread.id == thread_id))
	db.commit()
	return {"success": True}


@router.get("/profiles/{username}/threads", response_model=list[ThreadWithAuthorOut])
def profile_threads(username: str, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
	from sqlalchemy import select, func
	from sqlalchemy.orm import joinedload
	subject = db.execute(select(CommunityUser).where(CommunityUser.username == username)).scalar_one_or_none()
	if not subject:
		raise HTTPException(status_code=404, detail="User not found")
	likes_sq = (
		select(Like.thread_id, func.count(Like.id).label("likes")).group_by(Like.thread_id).subquery()
	)
	reposts_sq = (
		select(Repost.thread_id, func.count(Repost.id).label("reposts")).group_by(Repost.thread_id).subquery()
	)
	replies_sq = (
		select(Thread.in_reply_to_id.label("thread_id"), func.count(Thread.id).label("replies")).where(Thread.in_reply_to_id.is_not(None)).group_by(Thread.in_reply_to_id).subquery()
	)
	stmt = (
		select(Thread, func.coalesce(likes_sq.c.likes, 0), func.coalesce(reposts_sq.c.reposts, 0), func.coalesce(replies_sq.c.replies, 0))
		.options(joinedload(Thread.author), joinedload(Thread.media_items))
		.outerjoin(likes_sq, Thread.id == likes_sq.c.thread_id)
		.outerjoin(reposts_sq, Thread.id == reposts_sq.c.thread_id)
		.outerjoin(replies_sq, Thread.id == replies_sq.c.thread_id)
		.where(Thread.author_id == subject.id)
		.order_by(Thread.created_at.desc())
		.offset(offset)
		.limit(limit)
	)
	rows = db.execute(stmt).unique().all()
	result: list[dict] = []
	for thread, likes, reposts, replies in rows:
		mi = [
			{"id": m.id, "url": m.url, "media_type": getattr(m, "media_type", "image"), "alt_text": getattr(m, "alt_text", None)}
			for m in getattr(thread, "media_items", [])
		]
		result.append(
			{
				"id": thread.id,
				"author_id": thread.author_id,
				"content": thread.content,
				"in_reply_to_id": thread.in_reply_to_id,
				"created_at": thread.created_at,
				"updated_at": thread.updated_at,
				"media_items": mi,
				"author": {
					"id": thread.author.id if thread.author else None,
					"username": thread.author.username if thread.author else None,
					"display_name": thread.author.display_name if thread.author else None,
					"avatar_url": thread.author.avatar_url if thread.author else None,
				},
				"likes": int(likes or 0),
				"reposts": int(reposts or 0),
				"replies": int(replies or 0),
			}
		)
	return result


@router.post("/threads/{thread_id}/reply", response_model=ThreadOut)
def create_reply(thread_id: UUID, payload: ReplyCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
	# Replies are not rate-limited for non-verified users
	if not payload.content or not payload.content.strip():
		raise HTTPException(status_code=400, detail="Content required")
	parent = db.get(Thread, thread_id)
	if not parent:
		raise HTTPException(status_code=404, detail="Thread not found")
	return service.create_thread(db, author_id=user.id, content=payload.content, in_reply_to_id=thread_id)


@router.get("/threads/{thread_id}", response_model=ThreadWithAuthorOut)
async def get_thread(
    thread_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserInfo = Depends(get_current_user),
) -> ThreadWithAuthorOut:
    """Get a single thread by ID."""
    stmt = (
        select(Thread)
        .options(
            joinedload(Thread.author),
            joinedload(Thread.media_items),
        )
        .where(Thread.id == thread_id)
    )
    
    result = db.execute(stmt)
    thread = result.scalar_one_or_none()
    
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Get like/repost status for current user
    is_liked = db.query(Like).filter(
        Like.thread_id == thread.id,
        Like.user_id == current_user.id
    ).first() is not None
    
    is_reposted = db.query(Repost).filter(
        Repost.thread_id == thread.id,
        Repost.user_id == current_user.id
    ).first() is not None
    
    # Get counts
    likes_count = db.query(Like).filter(Like.thread_id == thread.id).count()
    replies_count = db.query(Thread).filter(Thread.in_reply_to_id == thread.id).count()
    reposts_count = db.query(Repost).filter(Repost.thread_id == thread.id).count()
    
    return ThreadWithAuthorOut(
        id=thread.id,
        author_id=thread.author_id,
        content=thread.content,
        in_reply_to_id=thread.in_reply_to_id,
        created_at=thread.created_at,
        updated_at=thread.updated_at,
        media_items=[
            MediaItemOut(
                id=mi.id,
                url=mi.url,
                media_type=mi.media_type,
                alt_text=mi.alt_text,
            ) for mi in thread.media_items
        ] if thread.media_items else [],
        author=AuthorMini(
            id=thread.author.id if thread.author else None,
            username=thread.author.username if thread.author else None,
            display_name=thread.author.display_name if thread.author else None,
            avatar_url=thread.author.avatar_url if thread.author else None,
        ) if thread.author else None,
        likes=likes_count,
        replies=replies_count,
        reposts=reposts_count,
    )


@router.get("/threads/{thread_id}/replies", response_model=List[ThreadWithAuthorOut])
async def get_thread_replies(
    thread_id: UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: UserInfo = Depends(get_current_user),
) -> List[ThreadWithAuthorOut]:
    """Get replies to a specific thread."""
    stmt = (
        select(Thread)
        .options(
            joinedload(Thread.author),
            joinedload(Thread.media_items),
        )
        .where(Thread.in_reply_to_id == thread_id)
        .order_by(Thread.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    
    result = db.execute(stmt)
    threads = result.scalars().all()
    
    threads_with_authors = []
    for thread in threads:
        # Get like/repost status for current user
        is_liked = db.query(Like).filter(
            Like.thread_id == thread.id,
            Like.user_id == current_user.id
        ).first() is not None
        
        is_reposted = db.query(Repost).filter(
            Repost.thread_id == thread.id,
            Repost.user_id == current_user.id
        ).first() is not None
        
        # Get counts
        likes_count = db.query(Like).filter(Like.thread_id == thread.id).count()
        replies_count = db.query(Thread).filter(Thread.in_reply_to_id == thread.id).count()
        reposts_count = db.query(Repost).filter(Repost.thread_id == thread.id).count()
        
        threads_with_authors.append(ThreadWithAuthorOut(
            id=thread.id,
            author_id=thread.author_id,
            content=thread.content,
            in_reply_to_id=thread.in_reply_to_id,
            created_at=thread.created_at,
            updated_at=thread.updated_at,
            media_items=[
                MediaItemOut(
                    id=mi.id,
                    url=mi.url,
                    media_type=mi.media_type,
                    alt_text=mi.alt_text,
                ) for mi in thread.media_items
            ] if thread.media_items else [],
            author=AuthorMini(
                id=thread.author.id if thread.author else None,
                username=thread.author.username if thread.author else None,
                display_name=thread.author.display_name if thread.author else None,
                avatar_url=thread.author.avatar_url if thread.author else None,
            ) if thread.author else None,
            likes=likes_count,
            replies=replies_count,
            reposts=reposts_count,
        ))
    
    return threads_with_authors


@router.post("/media/presign", response_model=PresignedUrlResponse)
def create_presigned_media_url(req: PresignedUrlRequest):
	minio_service.ensure_all_buckets()
	bucket = minio_service.get_bucket_for("thread")
	object_key = f"uploads/{req.filename}"
	url = minio_service.presign_put(bucket, object_key)
	return PresignedUrlResponse(url=url, object_key=object_key)


@router.post("/media/attach", response_model=MediaItemOut)
def attach_media(req: AttachMediaRequest, db: Session = Depends(get_db)):
	media = service.attach_media_to_thread(
		db,
		thread_id=req.thread_id,
		object_key=req.object_key,
		media_type=req.media_type,
		alt_text=req.alt_text,
	)
	return media


@router.get("/trending", response_model=list[dict])
def trending_hashtags(limit: int = 10, db: Session = Depends(get_db)):
	from sqlalchemy import select, func
	stmt = (
		select(Hashtag.tag, func.count(ThreadHashtag.id).label("count"))
		.join(ThreadHashtag, ThreadHashtag.hashtag_id == Hashtag.id)
		.group_by(Hashtag.id)
		.order_by(func.count(ThreadHashtag.id).desc())
		.limit(limit)
	)
	rows = db.execute(stmt).all()
	return [{"tag": tag, "count": count} for tag, count in rows]


# Admin moderation
@router.delete("/admin/threads/{thread_id}", response_model=ActionOut)
def admin_delete_thread(thread_id: UUID, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
	from sqlalchemy import delete
	db.execute(delete(Thread).where(Thread.id == thread_id))
	db.commit()
	return {"success": True}


@router.delete("/admin/users/{user_id}")
def admin_delete_user(user_id: UUID, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
	from sqlalchemy import delete
	# Deleting user will cascade to threads and relations
	db.execute(delete(CommunityUser).where(CommunityUser.id == user_id))
	db.commit()
	return {"success": True}


@router.post("/profiles/me/avatar/presign", response_model=PresignedUrlResponse)
def presign_avatar(file: UploadFile = File(...), user=Depends(get_current_user)):
    """Generate a presigned URL so the client can upload the avatar directly to MinIO.
    Returns both url and object_key.
    """
    minio_service.ensure_all_buckets()
    bucket = minio_service.get_bucket_for("avatar")
    ext = minio_service.pick_image_extension(file.filename, file.content_type)
    object_key = f"avatars/{user.id}/{uuid4().hex}.{ext}"
    url = minio_service.presign_put(bucket, object_key)
    return PresignedUrlResponse(url=url, object_key=object_key)


@router.post("/profiles/me/avatar/attach")
def attach_avatar(req: AttachMediaRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Finalize an avatar upload by saving the public URL to the user's profile."""
    bucket = minio_service.get_bucket_for("avatar")
    public_url = minio_service.build_public_url(bucket=bucket, object_key=req.object_key)
    subject = db.get(CommunityUser, user.id)
    if not subject:
        raise HTTPException(status_code=404, detail="User not found")
    subject.avatar_url = public_url
    db.commit()
    return {"avatar_url": public_url}


@router.get("/profiles/{username}", response_model=ProfileOut)
def get_profile(username: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
	from sqlalchemy import select, func
	subject = db.execute(select(CommunityUser).where(CommunityUser.username == username)).scalar_one_or_none()
	if not subject:
		raise HTTPException(status_code=404, detail="User not found")
	threads_count = db.execute(select(func.count(Thread.id)).where(Thread.author_id == subject.id)).scalar_one() or 0
	return {
		"id": subject.id,
		"username": subject.username,
		"display_name": subject.display_name,
		"bio": subject.bio,
		"avatar_url": subject.avatar_url,
		"created_at": subject.created_at,
		"counts": {"threads": threads_count},
	}


@router.get("/activity/recent")
def recent_activity(db: Session = Depends(get_db), user=Depends(get_current_user)):
	from sqlalchemy import select
	from sqlalchemy.orm import joinedload
	from .models import Notification
	stmt = (
		select(Notification)
		.options(joinedload(Notification.actor))
		.where(Notification.recipient_id == user.id)
		.order_by(Notification.created_at.desc())
		.limit(20)
	)
	notes = db.execute(stmt).scalars().all()
	return [
		{
			"id": n.id,
			"type": n.type,
			"thread_id": n.thread_id,
			"actor": {
				"id": n.actor.id if n.actor else None,
				"username": n.actor.username if n.actor else None,
				"display_name": getattr(n.actor, "display_name", None) if n.actor else None,
				"avatar_url": getattr(n.actor, "avatar_url", None) if n.actor else None,
			},
			"created_at": n.created_at,
		}
		for n in notes
	]