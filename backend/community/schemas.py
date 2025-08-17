from typing import List, Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


# Shared configs
class ORMModel(BaseModel):
    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }


# User
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    display_name: Optional[str] = Field(default=None, max_length=80)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserOut(ORMModel):
    id: UUID
    username: str
    display_name: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    updated_at: datetime


# Post
class MediaItemOut(ORMModel):
    id: UUID
    url: str
    media_type: str
    alt_text: Optional[str]


class PostCreate(BaseModel):
    author_id: UUID
    content: str
    in_reply_to_id: Optional[UUID] = None
    media_keys: Optional[List[str]] = None  # object keys already uploaded


class PostOut(ORMModel):
    id: UUID
    author_id: UUID
    content: str
    in_reply_to_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    media_items: List[MediaItemOut] = []


class AuthorMini(ORMModel):
    id: UUID
    username: str
    display_name: Optional[str] = None


class PostWithAuthorOut(PostOut):
    author: AuthorMini
    likes: int = 0
    reposts: int = 0
    replies: int = 0


class ProfileCounts(BaseModel):
    posts: int
    followers: int
    following: int


class ProfileOut(ORMModel):
    id: UUID
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    counts: ProfileCounts
    is_following: bool = False


class ReplyCreate(BaseModel):
    content: str


class ThreadOut(BaseModel):
    post: PostWithAuthorOut
    replies: List[PostWithAuthorOut] = []


# Social actions
class ActionOut(BaseModel):
    success: bool


# Media
class PresignedUrlRequest(BaseModel):
    filename: str
    content_type: str


class PresignedUrlResponse(BaseModel):
    url: str
    object_key: str


class AttachMediaRequest(BaseModel):
    post_id: UUID
    object_key: str
    media_type: str
    alt_text: Optional[str] = None

