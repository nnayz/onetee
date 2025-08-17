import os
from datetime import timedelta
from typing import Literal

from minio import Minio


class MinioService:
    """Class-based MinIO manager with two logical buckets.

    Buckets (configurable via env with sane defaults):
    - MINIO_BUCKET_AVATARS (default: onetee-avatars)
    - MINIO_BUCKET_POSTS   (default: onetee-posts)
    """

    def __init__(self) -> None:
        endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
        access_key = os.getenv("MINIO_ROOT_USER", "minioadmin")
        secret_key = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin")
        secure = os.getenv("MINIO_SECURE", "false").lower() == "true"
        self.client = Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=secure)

        self.bucket_avatars = os.getenv("MINIO_BUCKET_AVATARS", "onetee-avatars")
        self.bucket_posts = os.getenv("MINIO_BUCKET_POSTS", "onetee-posts")

    def ensure_bucket(self, bucket: str) -> None:
        if not self.client.bucket_exists(bucket):
            self.client.make_bucket(bucket)

    def ensure_all_buckets(self) -> None:
        for b in (self.bucket_avatars, self.bucket_posts):
            self.ensure_bucket(b)

    def get_bucket_for(self, kind: Literal["avatar", "post"]) -> str:
        if kind == "avatar":
            return self.bucket_avatars
        return self.bucket_posts

    def presign_put(self, bucket: str, object_key: str, expires_seconds: int = 900) -> str:
        return self.client.presigned_put_object(
            bucket, object_key, expires=timedelta(seconds=expires_seconds)
        )
