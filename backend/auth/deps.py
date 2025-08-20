from fastapi import Depends, HTTPException, Request, status
import os
from sqlalchemy.orm import Session

from database import get_db
from .security import decode_token
from community.models import User

from dotenv import load_dotenv
load_dotenv()


COOKIE_NAME = "access_token"


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    # Cookie-only auth: read JWT from HttpOnly cookie
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user")
        return user
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


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


def get_admin_user(username: str, password: str) -> bool:
    # Allow either configured admin identity or is_admin flag
    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password = os.getenv("ADMIN_PASSWORD")
    allowed = admin_username and username == admin_username and admin_password and password == admin_password
    if not allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return allowed

