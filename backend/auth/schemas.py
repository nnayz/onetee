from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime


class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str | None = None


class LoginRequest(BaseModel):
    username_or_email: str
    password: str


class UserInfo(BaseModel):
    id: UUID
    username: str
    email: EmailStr | None = None
    display_name: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    user: UserInfo
    token: str
