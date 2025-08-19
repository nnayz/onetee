## Auth

Prefix: `/auth`

- POST `/auth/signup`
  - Body: `{ username, email, password, display_name? }`
  - Returns: user info
  - Example:
    ```bash
    curl -X POST "$BASE/auth/signup" \
      -H 'Content-Type: application/json' \
      -d '{"username":"alice","email":"a@ex.com","password":"secret","display_name":"Alice"}'
    ```

- POST `/auth/login`
  - Body: `{ username_or_email, password }`
  - Sets HttpOnly cookie `access_token`
  - Returns: user info
  - Example:
    ```bash
    curl -i -X POST "$BASE/auth/login" \
      -H 'Content-Type: application/json' \
      -c cookies.txt \
      -d '{"username_or_email":"alice","password":"secret"}'
    ```

- POST `/auth/logout`
  - Clears auth cookie
  - Example:
    ```bash
    curl -X POST "$BASE/auth/logout" -b cookies.txt -c cookies.txt
    ```

- GET `/auth/me`
  - Requires cookie auth
  - Returns: user info
  - Example:
    ```bash
    curl "$BASE/auth/me" -b cookies.txt
    ```
