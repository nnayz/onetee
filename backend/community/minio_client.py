import os
from datetime import timedelta

from minio import Minio


def get_minio_client() -> Minio:
    endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    access_key = os.getenv("MINIO_ROOT_USER", "minioadmin")
    secret_key = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin")
    secure = os.getenv("MINIO_SECURE", "false").lower() == "true"
    return Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=secure)


def ensure_bucket(client: Minio, bucket_name: str) -> None:
    if not client.bucket_exists(bucket_name):
        client.make_bucket(bucket_name)


def create_presigned_put_url(client: Minio, bucket: str, object_key: str, content_type: str, expires_seconds: int = 900) -> str:
    return client.presigned_put_object(bucket, object_key, expires=timedelta(seconds=expires_seconds))

