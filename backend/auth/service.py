from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import select

from community.models import User
from .security import hash_password, verify_password, create_access_token


class AuthService:
    def signup(self, db: Session, *, username: str, email: str, password: str, display_name: Optional[str]) -> User:
        existing = db.execute(select(User).where((User.username == username) | (User.email == email))).scalar_one_or_none()
        if existing:
            raise ValueError("Username or email already exists")
        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            display_name=display_name or username,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def authenticate(self, db: Session, *, username_or_email: str, password: str) -> Optional[User]:
        user = db.execute(select(User).where((User.username == username_or_email) | (User.email == username_or_email))).scalar_one_or_none()
        if not user or not user.password_hash or not verify_password(password, user.password_hash):
            return None
        return user

    def issue_token(self, *, user_id: UUID) -> str:
        return create_access_token(str(user_id))
