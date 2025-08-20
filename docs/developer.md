# Developer Guide

This guide covers local setup, environment variables, project layout, API usage, and common workflows for OneTee.

## Prerequisites
- Node.js 20+
- pnpm or npm
- Python 3.11+
- PostgreSQL 14+
- MinIO (or S3-compatible)

## Project layout
```
onetee/
  backend/             # FastAPI app
    api/               # App entry + router mounts
    auth/              # Auth endpoints, deps, service
    community/         # Community domain
    marketplace/       # Shop domain and admin router
    storage/           # MinIO service
    migrations/        # Alembic
    pyproject.toml
  frontend/            # React + Vite
  docs/                # API and developer docs
```

## Backend: Environment
Required (PostgreSQL):
- POSTGRES_USER
- POSTGRES_PASSWORD
- POSTGRES_DB
- POSTGRES_HOST (default 127.0.0.1)
- POSTGRES_PORT (default 5432)

Auth:
- JWT_SECRET (required)
- JWT_ALG (default HS256)
- ADMIN_USERNAME or ADMIN_EMAIL (optional admin override)

MinIO:
- MINIO_ENDPOINT (default localhost:9000)
- MINIO_ROOT_USER / MINIO_ROOT_PASSWORD (default minioadmin)
- MINIO_SECURE (default false)
- Buckets: MINIO_BUCKET_AVATARS, MINIO_BUCKET_POSTS, MINIO_BUCKET_PRODUCTS
- Public URL: PUBLIC_FILE_BASE_URL or MINIO_PUBLIC_ENDPOINT

Payments (Stripe, optional):
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- PUBLIC_URL (frontend URL for redirects)

## Running locally
Backend (from backend/):
```bash
python -m venv .venv && source .venv/bin/activate
pip install -U pip
pip install -e .
uvicorn api.main:app --reload
```

Frontend (from frontend/):
```bash
pnpm install
pnpm dev
```
Set VITE_API_URL in frontend/.env to your backend origin.

## Admin vs Public APIs
- Public shop endpoints live under /shop.
- Admin endpoints live under /shop/admin and are guarded by get_admin_user, which allows users with is_admin=true or identities matching ADMIN_USERNAME/ADMIN_EMAIL.

## Image uploads
- Admin product creation accepts multipart form uploads for images.
- Upload is handled by storage.MinioService with helpers:
  - upload_product_uploadfiles(sku, files) → returns public URLs
  - save_image_bytes(kind, prefix, original_filename, data, content_type) → general storage

## Community
- Posts, likes, reposts, trending, and activity documented in docs/community.md.
- Users can delete their own posts; profile page shows Delete for own posts.

## Search
- GET /shop/products/search?q=query searches name/description/tag names.

## Alembic
Run migrations from backend/:
```bash
alembic upgrade head
alembic revision -m "message" --autogenerate
```

## Conventions
- React Query v5 (no onSuccess in queries; use select and cache invalidation)
- Prefer small service functions over large endpoints
- Use absolute imports inside backend (from storage.minio_service import MinioService)

## Useful commands
```bash
# Backend tests (if configured)
pytest

# Lint (frontend)
pnpm -w lint
```

## Troubleshooting
- ImportError: relative import beyond top-level → switch to absolute import style
- MinIO public URLs: set PUBLIC_FILE_BASE_URL to your CDN or gateway host