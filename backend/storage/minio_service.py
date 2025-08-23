import os
from datetime import timedelta
from typing import Literal

from minio import Minio
from uuid import uuid4
from typing import Optional
try:
    # Optional import for convenience functions that accept UploadFile
    from fastapi import UploadFile  # type: ignore
except Exception:  # pragma: no cover - FastAPI not always available at import time
    UploadFile = None  # type: ignore


class MinioService:
    """Class-based MinIO manager with two logical buckets.

    Buckets (configurable via env with sane defaults):
    - MINIO_BUCKET_AVATARS  (default: onetee-avatars)
    - MINIO_BUCKET_THREADS    (default: onetee-threads)
    - MINIO_BUCKET_PRODUCTS (default: onetee-products)
    """

    def __init__(self) -> None:
        endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
        access_key = os.getenv("MINIO_ROOT_USER", "minioadmin")
        secret_key = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin")
        secure = os.getenv("MINIO_SECURE", "false").lower() == "true"
        region = os.getenv("MINIO_REGION", "ap-south-1")
        self.client = Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=secure, region=region)

        self.bucket_avatars = os.getenv("MINIO_BUCKET_AVATARS", "onetee-avatars")
        self.bucket_threads = os.getenv("MINIO_BUCKET_THREADS", "onetee-threads")
        self.bucket_products = os.getenv("MINIO_BUCKET_PRODUCTS", "onetee-products")

    def ensure_bucket(self, bucket: str) -> None:
        if not self.client.bucket_exists(bucket):
            self.client.make_bucket(bucket)

    def ensure_all_buckets(self) -> None:
        for b in (self.bucket_avatars, self.bucket_threads, self.bucket_products):
            self.ensure_bucket(b)
        
        # Set public read policy for avatar bucket
        self.set_avatar_bucket_public()

    def set_avatar_bucket_public(self) -> None:
        """Set the avatar bucket to allow public read access."""
        try:
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": "*"},
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{self.bucket_avatars}/*"
                    }
                ]
            }
            import json
            self.client.set_bucket_policy(self.bucket_avatars, json.dumps(policy))
            
            # Also set public read access for thread bucket
            thread_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": "*"},
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{self.bucket_threads}/*"
                    }
                ]
            }
            self.client.set_bucket_policy(self.bucket_threads, json.dumps(thread_policy))

            # Also set public read access for product bucket
            product_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": "*"},
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{self.bucket_products}/*"
                    }
                ]
            }
            self.client.set_bucket_policy(self.bucket_products, json.dumps(product_policy))
        except Exception as e:
            # Log but don't fail if policy setting fails
            print(f"Warning: Could not set public policy for buckets: {e}")

    def get_bucket_for(self, kind: Literal["avatar", "thread", "product"]) -> str:
        if kind == "avatar":
            return self.bucket_avatars
        if kind == "thread":
            return self.bucket_threads
        return self.bucket_products

    def presign_put(self, bucket: str, object_key: str, expires_seconds: int = 900) -> str:
        return self.client.presigned_put_object(
            bucket, object_key, expires=timedelta(seconds=expires_seconds)
        )

    def presign_get(self, bucket: str, object_key: str, expires_seconds: int = 3600) -> str:
        return self.client.presigned_get_object(
            bucket, object_key, expires=timedelta(seconds=expires_seconds)
        )

    def put_object_from_bytes(self, *, bucket: str, object_key: str, data: bytes, content_type: str | None = None) -> None:
        self.client.put_object(
            bucket,
            object_key,
            data=bytes_to_stream(data),
            length=len(data),
            content_type=content_type,
        )

    # ---------- Image helpers ----------
    def pick_image_extension(self, filename: str | None, content_type: Optional[str]) -> str:
        allowed = {"jpg", "jpeg", "png", "webp"}
        ext = None
        if filename and "." in filename:
            ext = filename.rsplit(".", 1)[1].lower()
        if not ext and content_type:
            if "/" in content_type:
                ext = content_type.split("/", 1)[1].lower()
        if ext not in allowed:
            return "jpg"
        return ext

    def build_public_url(self, *, bucket: str, object_key: str) -> str:
        public = os.getenv("PUBLIC_FILE_BASE_URL") or os.getenv("MINIO_PUBLIC_ENDPOINT")
        if not public:
            # Fallback for development - use localhost:9000
            public = "http://localhost:9000"
        return f"{public}/{bucket}/{object_key}"

    def save_image_bytes(self, *, kind: Literal["avatar", "post", "product"], prefix: str, original_filename: Optional[str], data: bytes, content_type: Optional[str]) -> str:
        self.ensure_all_buckets()
        bucket = self.get_bucket_for(kind)
        ext = self.pick_image_extension(original_filename, content_type)
        object_key = f"{prefix}{uuid4().hex}.{ext}"
        self.put_object_from_bytes(bucket=bucket, object_key=object_key, data=data, content_type=content_type)
        return self.build_public_url(bucket=bucket, object_key=object_key)

    def upload_product_uploadfiles(self, sku: str, files: list["UploadFile"]) -> list[str]:  # type: ignore[name-defined]
        # Convenience for admin product create endpoint
        urls: list[str] = []
        if not files:
            return urls
        prefix = f"products/{sku}/"
        for f in files:
            try:
                data = f.file.read()
            except Exception:
                continue
            url = self.save_image_bytes(
                kind="product",
                prefix=prefix,
                original_filename=getattr(f, "filename", None),
                data=data,
                content_type=getattr(f, "content_type", None),
            )
            urls.append(url)
        return urls


def bytes_to_stream(data: bytes):
    from io import BytesIO
    return BytesIO(data)
