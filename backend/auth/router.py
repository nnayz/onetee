from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session

from database import get_db
from .service import AuthService
from .schemas import SignupRequest, LoginRequest, UserInfo
from .security import decode_token
from community.models import User


router = APIRouter(prefix="/auth", tags=["Auth"]) 
service = AuthService()


COOKIE_NAME = "access_token"


def set_auth_cookie(response: Response, token: str) -> None:
    # For cross-origin requests with cookies, SameSite=None and Secure are required
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(COOKIE_NAME, path="/")


@router.post("/signup", response_model=UserInfo)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    try:
        user = service.signup(
            db,
            username=payload.username,
            email=payload.email,
            password=payload.password,
            display_name=payload.display_name,
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=UserInfo)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = service.authenticate(db, username_or_email=payload.username_or_email, password=payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = service.issue_token(user_id=user.id)
    set_auth_cookie(response, token)
    return user


@router.post("/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"success": True}


@router.get("/me", response_model=UserInfo)
def me(request: Request, db: Session = Depends(get_db)):
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
