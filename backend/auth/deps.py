from fastapi import Depends, HTTPException, Request
import os
from sqlalchemy.orm import Session

from database import get_db
from .security import decode_token
from community.models import User


COOKIE_NAME = "access_token"


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    # Cookie-only auth: read JWT from HttpOnly cookie
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid user")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_optional_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        user = db.get(User, user_id)
        return user
    except Exception:
        return None


def get_admin_user(request: Request, db: Session = Depends(get_db)) -> User:
    user = get_current_user(request, db)
    # Allow either configured admin identity or is_admin flag
    admin_username = os.getenv("ADMIN_USERNAME")
    admin_email = os.getenv("ADMIN_EMAIL")
    allowed = False
    if getattr(user, "is_admin", False):
        allowed = True
    if admin_username and user.username == admin_username:
        allowed = True
    if admin_email and getattr(user, "email", None) == admin_email:
        allowed = True
    if not allowed:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

