from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from auth.deps import get_current_user, get_admin_user
from .models import *  # noqa: F401,F403
from .services.community_service import CommunityService
from .schemas import (
	PostCreate,
	PostOut,
	PostWithAuthorOut,
	ProfileOut,
	ReplyCreate,
	ThreadOut,
	ActionOut,
	PresignedUrlRequest,
	PresignedUrlResponse,
	AttachMediaRequest,
	MediaItemOut,
)
from storage.minio_service import MinioService

router = APIRouter(
	tags=["OneTee Community"],
)

minio_service = MinioService()
service = CommunityService()

# Posts
@router.post("/posts", response_model=PostOut)
def create_post(payload: PostCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
	# Enforce daily post limit for non-verified users (top-level posts only)
	from datetime import datetime, timedelta
	if not getattr(user, "is_verified", False) and payload.in_reply_to_id is None:
		start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
		end = start + timedelta(days=1)
		from sqlalchemy import select, func
		count = db.execute(
			select(func.count(Post.id)).where(
				Post.author_id == user.id,
				Post.created_at >= start,
				Post.created_at < end,
				Post.in_reply_to_id.is_(None),
			)
		).scalar_one() or 0
		if count >= 10:
			raise HTTPException(status_code=403, detail="Daily post limit reached. Verify your account to post without limits.")
	if not payload.content or not payload.content.strip():
		raise HTTPException(status_code=400, detail="Content required")
	post = service.create_post(
		db,
		author_id=user.id,
		content=payload.content,
		in_reply_to_id=payload.in_reply_to_id,
	)
	# Optionally, attach any provided media_keys
	if payload.media_keys:
		for key in payload.media_keys:
			service.attach_media_to_post(db, post_id=post.id, object_key=key, media_type="image", alt_text=None)
		db.refresh(post)
	return post


# Social actions
@router.post("/posts/{post_id}/like", response_model=ActionOut)
def like_post(post_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
	service.like_post(db, user_id=user.id, post_id=post_id)
	return {"success": True}


@router.get("/posts", response_model=list[PostWithAuthorOut])
def list_posts(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
	# newest first with engagement counts
	from sqlalchemy import select, func
	from sqlalchemy.orm import joinedload
	likes_sq = (
		select(Like.post_id, func.count(Like.id).label("likes")).group_by(Like.post_id).subquery()
	)
	reposts_sq = (
		select(Repost.post_id, func.count(Repost.id).label("reposts")).group_by(Repost.post_id).subquery()
	)
	replies_sq = (
		select(Post.in_reply_to_id.label("post_id"), func.count(Post.id).label("replies")).where(Post.in_reply_to_id.is_not(None)).group_by(Post.in_reply_to_id).subquery()
	)
	stmt = (
		select(Post, func.coalesce(likes_sq.c.likes, 0), func.coalesce(reposts_sq.c.reposts, 0), func.coalesce(replies_sq.c.replies, 0))
		.options(joinedload(Post.author))
		.outerjoin(likes_sq, Post.id == likes_sq.c.post_id)
		.outerjoin(reposts_sq, Post.id == reposts_sq.c.post_id)
		.outerjoin(replies_sq, Post.id == replies_sq.c.post_id)
		.order_by(Post.created_at.desc())
		.offset(offset)
		.limit(limit)
	)
	rows = db.execute(stmt).all()
	result: list[dict] = []
	for post, likes, reposts, replies in rows:
		result.append(
			{
				"id": post.id,
				"author_id": post.author_id,
				"content": post.content,
				"in_reply_to_id": post.in_reply_to_id,
				"created_at": post.created_at,
				"updated_at": post.updated_at,
				"media_items": [],
				"author": {
					"id": post.author.id if post.author else None,
					"username": post.author.username if post.author else None,
					"display_name": post.author.display_name if post.author else None,
				},
				"likes": int(likes or 0),
				"reposts": int(reposts or 0),
				"replies": int(replies or 0),
			}
		)
	return result



@router.post("/posts/{post_id}/repost", response_model=ActionOut)
def repost_post(post_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
	service.repost_post(db, user_id=user.id, post_id=post_id)
	return {"success": True}


@router.post("/posts/{post_id}/bookmark", response_model=ActionOut)
def bookmark_post(post_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
	service.bookmark_post(db, user_id=user.id, post_id=post_id)
	return {"success": True}


# Follow/Unfollow removed from product requirements


@router.delete("/posts/{post_id}", response_model=ActionOut)
def delete_own_post(post_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
	from sqlalchemy import delete
	post = db.get(Post, post_id)
	if not post:
		raise HTTPException(status_code=404, detail="Not found")
	if post.author_id != user.id:
		raise HTTPException(status_code=403, detail="Not allowed")
	# Cascades remove related rows
	db.execute(delete(Post).where(Post.id == post_id))
	db.commit()
	return {"success": True}


@router.get("/profiles/{username}", response_model=ProfileOut)
def get_profile(username: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
	from sqlalchemy import select, func
	subject = db.execute(select(User).where(User.username == username)).scalar_one_or_none()
	if not subject:
		raise HTTPException(status_code=404, detail="User not found")
	posts_count = db.execute(select(func.count(Post.id)).where(Post.author_id == subject.id)).scalar_one() or 0
	return {
		"id": subject.id,
		"username": subject.username,
		"display_name": subject.display_name,
		"bio": subject.bio,
		"avatar_url": subject.avatar_url,
		"created_at": subject.created_at,
		"counts": {"posts": posts_count},
	}


@router.get("/profiles/{username}/posts", response_model=list[PostWithAuthorOut])
def profile_posts(username: str, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
	from sqlalchemy import select, func
	from sqlalchemy.orm import joinedload
	subject = db.execute(select(User).where(User.username == username)).scalar_one_or_none()
	if not subject:
		raise HTTPException(status_code=404, detail="User not found")
	likes_sq = (
		select(Like.post_id, func.count(Like.id).label("likes")).group_by(Like.post_id).subquery()
	)
	reposts_sq = (
		select(Repost.post_id, func.count(Repost.id).label("reposts")).group_by(Repost.post_id).subquery()
	)
	replies_sq = (
		select(Post.in_reply_to_id.label("post_id"), func.count(Post.id).label("replies")).where(Post.in_reply_to_id.is_not(None)).group_by(Post.in_reply_to_id).subquery()
	)
	stmt = (
		select(Post, func.coalesce(likes_sq.c.likes, 0), func.coalesce(reposts_sq.c.reposts, 0), func.coalesce(replies_sq.c.replies, 0))
		.options(joinedload(Post.author))
		.outerjoin(likes_sq, Post.id == likes_sq.c.post_id)
		.outerjoin(reposts_sq, Post.id == reposts_sq.c.post_id)
		.outerjoin(replies_sq, Post.id == replies_sq.c.post_id)
		.where(Post.author_id == subject.id)
		.order_by(Post.created_at.desc())
		.offset(offset)
		.limit(limit)
	)
	rows = db.execute(stmt).all()
	result: list[dict] = []
	for post, likes, reposts, replies in rows:
		result.append(
			{
				"id": post.id,
				"author_id": post.author_id,
				"content": post.content,
				"in_reply_to_id": post.in_reply_to_id,
				"created_at": post.created_at,
				"updated_at": post.updated_at,
				"media_items": [],
				"author": {
					"id": post.author.id if post.author else None,
					"username": post.author.username if post.author else None,
					"display_name": post.author.display_name if post.author else None,
				},
				"likes": int(likes or 0),
				"reposts": int(reposts or 0),
				"replies": int(replies or 0),
			}
		)
	return result


@router.post("/posts/{post_id}/reply", response_model=PostOut)
def create_reply(post_id: UUID, payload: ReplyCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
	# Replies are not rate-limited for non-verified users
	from datetime import datetime, timedelta
	# no daily limit check here
	if not payload.content or not payload.content.strip():
		raise HTTPException(status_code=400, detail="Content required")
	parent = db.get(Post, post_id)
	if not parent:
		raise HTTPException(status_code=404, detail="Post not found")
	return service.create_post(db, author_id=user.id, content=payload.content, in_reply_to_id=post_id)


@router.get("/posts/{post_id}", response_model=ThreadOut)
def get_thread(post_id: UUID, db: Session = Depends(get_db)):
	from sqlalchemy import select
	from sqlalchemy.orm import joinedload
	post = db.get(Post, post_id)
	if not post:
		raise HTTPException(status_code=404, detail="Not found")
	stmt = (
		select(Post)
		.options(joinedload(Post.author))
		.where(Post.in_reply_to_id == post_id)
		.order_by(Post.created_at.asc())
	)
	replies = db.execute(stmt).scalars().all()
	return {"post": post, "replies": replies}


@router.get("/activity/recent")
def recent_activity(db: Session = Depends(get_db), user=Depends(get_current_user)):
	from sqlalchemy import select
	from sqlalchemy.orm import joinedload
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
			"post_id": n.post_id,
			"actor": {
				"id": n.actor.id if n.actor else None,
				"username": n.actor.username if n.actor else None,
				"display_name": getattr(n.actor, "display_name", None) if n.actor else None,
			},
			"created_at": n.created_at,
		}
		for n in notes
	]


# MinIO media
@router.post("/media/presign", response_model=PresignedUrlResponse)
def create_presigned_media_url(req: PresignedUrlRequest):
	minio_service.ensure_all_buckets()
	bucket = minio_service.get_bucket_for("post")
	object_key = f"uploads/{req.filename}"
	url = minio_service.presign_put(bucket, object_key)
	return PresignedUrlResponse(url=url, object_key=object_key)


@router.post("/media/attach", response_model=MediaItemOut)
def attach_media(req: AttachMediaRequest, db: Session = Depends(get_db)):
	media = service.attach_media_to_post(
		db,
		post_id=req.post_id,
		object_key=req.object_key,
		media_type=req.media_type,
		alt_text=req.alt_text,
	)
	return media



# "Who to follow" removed from product requirements


@router.get("/trending/tags")
def trending_tags(db: Session = Depends(get_db), limit: int = 10):
	from sqlalchemy import select, func
	stmt = (
		select(Hashtag.tag, func.count(PostHashtag.id).label("count"))
		.join(PostHashtag, PostHashtag.hashtag_id == Hashtag.id)
		.group_by(Hashtag.id)
		.order_by(func.count(PostHashtag.id).desc())
		.limit(limit)
	)
	rows = db.execute(stmt).all()
	return [{"tag": tag, "count": int(count or 0)} for tag, count in rows]


# Admin moderation
@router.delete("/admin/posts/{post_id}")
def admin_delete_post(post_id: UUID, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
	from sqlalchemy import delete
	db.execute(delete(Post).where(Post.id == post_id))
	db.commit()
	return {"success": True}


@router.delete("/admin/users/{user_id}")
def admin_delete_user(user_id: UUID, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
	from sqlalchemy import delete
	# Deleting user will cascade to posts and relations
	db.execute(delete(User).where(User.id == user_id))
	db.commit()
	return {"success": True}

