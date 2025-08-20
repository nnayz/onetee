"""
Community service layer.

This module defines a single class, CommunityService, that exposes all
domain operations needed by the OneTee Community feature. Methods are
kept small and purposeful to make the service easy to read, test, and
evolve.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import (
    User,
    Post,
    Media,
    Like,
    Repost,
    Bookmark,
    Follow,
    Notification,
    Hashtag,
    PostHashtag,
)


class CommunityService:
    """Business logic for the community domain.

    The service is stateless; callers pass a SQLAlchemy Session per
    operation. This keeps transaction boundaries clear and makes the
    service easy to compose in request handlers and background jobs.
    """

    # Users: creation handled by AuthService.signup

    # Posts
    def create_post(
        self,
        db: Session,
        *,
        author_id: UUID,
        content: str,
        in_reply_to_id: Optional[UUID],
    ) -> Post:
        post = Post(
            author_id=author_id,
            content=content,
            in_reply_to_id=in_reply_to_id,
        )
        db.add(post)
        db.commit()
        db.refresh(post)
        # Extract hashtags and notify parent on reply
        self._extract_and_attach_hashtags(db, post_id=post.id, content=content)
        if in_reply_to_id:
            parent = db.get(Post, in_reply_to_id)
            if parent and parent.author_id != author_id:
                db.add(
                    Notification(
                        recipient_id=parent.author_id,
                        actor_id=author_id,
                        type="reply",
                        post_id=post.id,
                    )
                )
                db.commit()
        return post

    def attach_media_to_post(
        self,
        db: Session,
        *,
        post_id: UUID,
        object_key: str,
        media_type: str,
        alt_text: Optional[str],
    ) -> Media:
        media = Media(
            post_id=post_id,
            url=object_key,
            media_type=media_type,
            alt_text=alt_text,
        )
        db.add(media)
        db.commit()
        db.refresh(media)
        return media

    # Helpers
    def _extract_and_attach_hashtags(self, db: Session, *, post_id: UUID, content: str) -> None:
        import re
        tags = set([t.lower() for t in re.findall(r"#(\w+)", content or "") if t])
        if not tags:
            return
        for tag in tags:
            existing = db.execute(select(Hashtag).where(Hashtag.tag == tag)).scalar_one_or_none()
            if not existing:
                existing = Hashtag(tag=tag)
                db.add(existing)
                db.flush()
            has_link = db.execute(
                select(PostHashtag).where(PostHashtag.post_id == post_id, PostHashtag.hashtag_id == existing.id)
            ).scalar_one_or_none()
            if not has_link:
                db.add(PostHashtag(post_id=post_id, hashtag_id=existing.id))
        db.commit()

    # Social
    def like_post(self, db: Session, *, user_id: UUID, post_id: UUID) -> bool:
        existing = db.execute(
            select(Like).where(Like.user_id == user_id, Like.post_id == post_id)
        ).scalar_one_or_none()
        if existing:
            return True
        db.add(Like(user_id=user_id, post_id=post_id))
        # notify author
        post = db.get(Post, post_id)
        if post and post.author_id != user_id:
            db.add(
                Notification(
                    recipient_id=post.author_id,
                    actor_id=user_id,
                    type="like",
                    post_id=post_id,
                )
            )
        db.commit()
        return True

    def repost_post(self, db: Session, *, user_id: UUID, post_id: UUID) -> bool:
        existing = db.execute(
            select(Repost).where(Repost.user_id == user_id, Repost.post_id == post_id)
        ).scalar_one_or_none()
        if existing:
            return True
        db.add(Repost(user_id=user_id, post_id=post_id))
        post = db.get(Post, post_id)
        if post and post.author_id != user_id:
            db.add(
                Notification(
                    recipient_id=post.author_id,
                    actor_id=user_id,
                    type="repost",
                    post_id=post_id,
                )
            )
        db.commit()
        return True

    def bookmark_post(self, db: Session, *, user_id: UUID, post_id: UUID) -> bool:
        existing = db.execute(
            select(Bookmark).where(Bookmark.user_id == user_id, Bookmark.post_id == post_id)
        ).scalar_one_or_none()
        if existing:
            return True
        db.add(Bookmark(user_id=user_id, post_id=post_id))
        db.commit()
        return True

    def follow_user(
        self, db: Session, *, follower_id: UUID, following_id: UUID
    ) -> bool:
        if follower_id == following_id:
            return True
        existing = db.execute(
            select(Follow).where(
                Follow.follower_id == follower_id, Follow.following_id == following_id
            )
        ).scalar_one_or_none()
        if existing:
            return True
        db.add(Follow(follower_id=follower_id, following_id=following_id))
        if follower_id != following_id:
            db.add(
                Notification(
                    recipient_id=following_id,
                    actor_id=follower_id,
                    type="follow",
                )
            )
        db.commit()
        return True

