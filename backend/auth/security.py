import os
from typing import Optional

import jwt
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_secret_key() -> str:
    return os.getenv("JWT_SECRET", "change-me-in-prod")


def get_algorithm() -> str:
    return os.getenv("JWT_ALGORITHM", "HS256")


def get_access_token_expires_minutes() -> None:
    # Expiry disabled: always return None
    return None


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, extra_claims: Optional[dict] = None) -> str:
    to_encode = {"sub": subject}
    if extra_claims:
        to_encode.update(extra_claims)
    # No exp claim (non-expiring access tokens)
    encoded_jwt = jwt.encode(to_encode, get_secret_key(), algorithm=get_algorithm())
    return encoded_jwt


def decode_token(token: str) -> dict:
    return jwt.decode(token, get_secret_key(), algorithms=[get_algorithm()])
