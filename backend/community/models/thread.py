import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class Thread(Base):
    """Primary entity representing a short text thread (thread/tweet)."""

    __tablename__ = "community_threads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey("community_users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Content
    content = Column(Text, nullable=False)
    # Optional in-reply-to relationship (threaded replies)
    in_reply_to_id = Column(UUID(as_uuid=True), ForeignKey("community_threads.id", ondelete="CASCADE"), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    author = relationship("User", back_populates="threads")
    parent = relationship("Thread", remote_side=[id])
    media_items = relationship("Media", back_populates="thread", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="thread", cascade="all, delete-orphan")
    reposts = relationship("Repost", back_populates="thread", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="thread", cascade="all, delete-orphan")
    hashtags = relationship("ThreadHashtag", back_populates="thread", cascade="all, delete-orphan")
    mentions = relationship("Mention", back_populates="thread", cascade="all, delete-orphan")

