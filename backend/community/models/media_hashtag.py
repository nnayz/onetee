import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class Media(Base):
    __tablename__ = "community_media"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("community_threads.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(512), nullable=False)
    media_type = Column(String(20), nullable=False)  # image, video, gif
    alt_text = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    thread = relationship("Thread", back_populates="media_items")


class Hashtag(Base):
    __tablename__ = "community_hashtags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tag = Column(String(64), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    threads = relationship("ThreadHashtag", back_populates="hashtag", cascade="all, delete-orphan")


class ThreadHashtag(Base):
    __tablename__ = "community_post_hashtags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("community_threads.id", ondelete="CASCADE"), nullable=False, index=True)
    hashtag_id = Column(UUID(as_uuid=True), ForeignKey("community_hashtags.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    thread = relationship("Thread", back_populates="hashtags")
    hashtag = relationship("Hashtag", back_populates="threads")

    __table_args__ = (
        UniqueConstraint("thread_id", "hashtag_id", name="uq_thread_hashtag"),
    )


class Mention(Base):
    __tablename__ = "community_mentions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("community_threads.id", ondelete="CASCADE"), nullable=False, index=True)
    mentioned_user_id = Column(UUID(as_uuid=True), ForeignKey("community_users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    thread = relationship("Thread", back_populates="mentions")
    mentioned_user = relationship("User")

