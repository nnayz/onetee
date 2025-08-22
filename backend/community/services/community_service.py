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

from ..models import Thread, Like, Repost, Bookmark, Notification, Media


class CommunityService:
    """Business logic for the community domain.

    The service is stateless; callers pass a SQLAlchemy Session per
    operation. This keeps transaction boundaries clear and makes the
    service easy to compose in request handlers and background jobs.
    """

    # Users: creation handled by AuthService.signup

    # Threads
    def create_thread(
        self,
        db: Session,
        *,
        author_id: UUID,
        content: str,
        in_reply_to_id: Optional[UUID],
    ) -> Thread:
        thread = Thread(
            author_id=author_id,
            content=content,
            in_reply_to_id=in_reply_to_id,
        )
        db.add(thread)
        db.commit()
        db.refresh(thread)
        # Extract hashtags and notify parent on reply
        self._extract_and_attach_hashtags(db, thread_id=thread.id, content=content)
        if in_reply_to_id:
            parent = db.get(Thread, in_reply_to_id)
            if parent and parent.author_id != author_id:
                db.add(
                    Notification(
                        recipient_id=parent.author_id,
                        actor_id=author_id,
                        type="reply",
                        thread_id=thread.id,
                    )
                )
                db.commit()
        return thread

    def attach_media_to_thread(
        self,
        db: Session,
        *,
        thread_id: UUID,
        object_key: str,
        media_type: str,
        alt_text: Optional[str],
    ) -> Media:
        # Import here to avoid circular imports
        from storage.minio_service import MinioService
        minio_service = MinioService()
        bucket = minio_service.get_bucket_for("thread")
        public_url = minio_service.build_public_url(bucket=bucket, object_key=object_key)

        media = Media(
            thread_id=thread_id,
            url=public_url,
            media_type=media_type,
            alt_text=alt_text,
        )
        db.add(media)
        db.commit()
        db.refresh(media)
        return media

    def like_thread(self, db: Session, *, user_id: UUID, thread_id: UUID) -> bool:
        existing = db.execute(
            select(Like).where(Like.user_id == user_id, Like.thread_id == thread_id)
        ).scalar_one_or_none()
        if existing:
            return True
        db.add(Like(user_id=user_id, thread_id=thread_id))
        # notify author
        thread = db.get(Thread, thread_id)
        if thread and thread.author_id != user_id:
            db.add(
                Notification(
                    recipient_id=thread.author_id,
                    actor_id=user_id,
                    type="like",
                    thread_id=thread_id,
                )
            )
        db.commit()
        return True

    def repost_thread(self, db: Session, *, user_id: UUID, thread_id: UUID) -> bool:
        existing = db.execute(
            select(Repost).where(Repost.user_id == user_id, Repost.thread_id == thread_id)
        ).scalar_one_or_none()
        if existing:
            return True
        db.add(Repost(user_id=user_id, thread_id=thread_id))
        thread = db.get(Thread, thread_id)
        if thread and thread.author_id != user_id:
            db.add(
                Notification(
                    recipient_id=thread.author_id,
                    actor_id=user_id,
                    type="repost",
                    thread_id=thread_id,
                )
            )
        db.commit()
        return True

    def bookmark_thread(self, db: Session, *, user_id: UUID, thread_id: UUID) -> bool:
        existing = db.execute(
            select(Bookmark).where(Bookmark.user_id == user_id, Bookmark.thread_id == thread_id)
        ).scalar_one_or_none()
        if existing:
            return True
        db.add(Bookmark(user_id=user_id, thread_id=thread_id))
        db.commit()
        return True

    def _extract_and_attach_hashtags(self, db: Session, *, thread_id: UUID, content: str) -> None:
        """Extract hashtags from content and create relationships."""
        import re
        from ..models import Hashtag, ThreadHashtag

        hashtags = re.findall(r'#(\w+)', content)
        for tag in hashtags:
            # Get or create hashtag
            hashtag = db.execute(select(Hashtag).where(Hashtag.tag == tag)).scalar_one_or_none()
            if not hashtag:
                hashtag = Hashtag(tag=tag)
                db.add(hashtag)
                db.flush()  # Get the ID

            # Create relationship
            existing = db.execute(
                select(ThreadHashtag).where(
                    ThreadHashtag.thread_id == thread_id,
                    ThreadHashtag.hashtag_id == hashtag.id
                )
            ).scalar_one_or_none()
            if not existing:
                db.add(ThreadHashtag(thread_id=thread_id, hashtag_id=hashtag.id))

        db.commit()

