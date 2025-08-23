import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class Notification(Base):
    __tablename__ = "community_notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("community_users.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("community_users.id", ondelete="SET NULL"), nullable=True, index=True)
    # simple type system: like, repost, reply, follow, mention
    type = Column(String(24), nullable=False)
    # optional reference to a thread involved in the notification
    thread_id = Column(UUID(as_uuid=True), ForeignKey("community_threads.id", ondelete="SET NULL"), nullable=True, index=True)
    message = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="notifications_received")
    actor = relationship("User", foreign_keys=[actor_id], back_populates="notifications_sent")

