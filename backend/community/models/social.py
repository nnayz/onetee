import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class Like(Base):
	__tablename__ = "community_likes"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("community_users.id", ondelete="CASCADE"), nullable=False, index=True)
	thread_id = Column(UUID(as_uuid=True), ForeignKey("community_threads.id", ondelete="CASCADE"), nullable=False, index=True)
	created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

	user = relationship("User", back_populates="likes")
	thread = relationship("Thread", back_populates="likes")

	__table_args__ = (
		UniqueConstraint("user_id", "thread_id", name="uq_like_user_thread"),
	)


class Repost(Base):
	__tablename__ = "community_reposts"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("community_users.id", ondelete="CASCADE"), nullable=False, index=True)
	thread_id = Column(UUID(as_uuid=True), ForeignKey("community_threads.id", ondelete="CASCADE"), nullable=False, index=True)
	created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

	user = relationship("User", back_populates="reposts")
	thread = relationship("Thread", back_populates="reposts")

	__table_args__ = (
		UniqueConstraint("user_id", "thread_id", name="uq_repost_user_thread"),
	)


class Follow(Base):
    __tablename__ = "community_follows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    follower_id = Column(UUID(as_uuid=True), ForeignKey("community_users.id", ondelete="CASCADE"), nullable=False, index=True)
    following_id = Column(UUID(as_uuid=True), ForeignKey("community_users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    follower = relationship("User", foreign_keys=[follower_id], back_populates="following")
    following = relationship("User", foreign_keys=[following_id], back_populates="followers")

    __table_args__ = (
        UniqueConstraint("follower_id", "following_id", name="uq_follow_pair"),
    )


class Bookmark(Base):
	__tablename__ = "community_bookmarks"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("community_users.id", ondelete="CASCADE"), nullable=False, index=True)
	thread_id = Column(UUID(as_uuid=True), ForeignKey("community_threads.id", ondelete="CASCADE"), nullable=False, index=True)
	created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

	user = relationship("User", back_populates="bookmarks")
	thread = relationship("Thread", back_populates="bookmarks")

	__table_args__ = (
		UniqueConstraint("user_id", "thread_id", name="uq_bookmark_user_thread"),
	)

