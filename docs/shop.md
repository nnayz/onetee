## Shop (Public)

Prefix: `/shop`

- GET `/shop/products`
  - Query: `gender?=men|women`, `tag?`, `limit?`, `offset?`
  - Returns: product list
  - Example:
    ```bash
    curl "$BASE/shop/products?gender=men&tag=streetwear"
    ```

- GET `/shop/products/search`
  - Query: `q` (search string), `limit?`, `offset?`
  - Returns: product list
  - Example:
    ```bash
    curl "$BASE/shop/products/search?q=tee"
    ```

- GET `/shop/products/{product_id}`

- GET `/shop/tags`

- POST `/shop/orders`
  - Auth required
  - Body: `{ items: [{ product_id, variant_id?, quantity }] }`

- POST `/shop/orders/{order_id}/checkout`
  - Auth required
  - Returns: `{ checkout_url }`
