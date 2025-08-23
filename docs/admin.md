## Shop Admin

Prefix: `/shop/admin`

Auth: Requires admin cookie (user is admin or matches `ADMIN_USERNAME`/`ADMIN_EMAIL`).

Tags
- POST `/shop/admin/tags`
  - Body: `{ name, description? }`
- GET `/shop/admin/tags`
- PUT `/shop/admin/tags/{tag_id}`
  - Body: `{ name, description? }`
- DELETE `/shop/admin/tags/{tag_id}`

Products
- POST `/shop/admin/products` (multipart/form-data)
  - Fields (Form):
    - `sku` (string)
    - `name` (string)
    - `gender` ("men"|"women")
    - `price_cents` (int)
    - `currency` (string, default "INR")
    - `description` (string, optional)
    - `sizes` (comma-separated string, optional) e.g. `S,M,L,XL`
    - `colors` (comma-separated string, optional) e.g. `black,white`
    - `tags` (comma-separated string, optional) e.g. `streetwear,classic`
  - Files:
    - `images` (one or more files)
  - Images are uploaded to the MinIO products bucket. Public URLs are stored on the product.
  - Example:
    ```bash
    curl -X POST "$BASE/shop/admin/products" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -F "sku=TEE-001" \
      -F "name=Basic Tee" \
      -F "gender=men" \
      -F "price_cents=1499" \
      -F "currency=INR" \
      -F "description=Soft cotton tee" \
      -F "sizes=S,M,L,XL" \
      -F "colors=black,white" \
      -F "tags=streetwear,classic" \
      -F "images=@./images/tee1.jpg" \
      -F "images=@./images/tee2.png"
    ```
- DELETE `/shop/admin/products/{product_id}`

Assignments
- POST `/shop/admin/products/{product_id}/tags/{tag_id}`

Collections
- POST `/shop/admin/collections`
  - Note: 501 Not Implemented placeholder until models are added

MinIO configuration
- `MINIO_ENDPOINT`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_SECURE`
- Buckets: `MINIO_BUCKET_PRODUCTS` (default `onetee-products`)
- Public URL construction (optional): `PUBLIC_FILE_BASE_URL` or `MINIO_PUBLIC_ENDPOINT`
