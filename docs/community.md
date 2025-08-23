## Community

Prefix: `/community`

- GET `/community/posts`
  - Query: `limit?`, `offset?`
  - Returns: list of posts with author and counts
  - Example:
    ```bash
    curl "$BASE/community/posts?limit=20"
    ```

- POST `/community/posts`
  - Auth required (cookie)
  - Body: `{ content, in_reply_to_id?, media_keys? }`
  - Returns: created post
  - Example:
    ```bash
    curl -X POST "$BASE/community/posts" -b cookies.txt \
      -H 'Content-Type: application/json' \
      -d '{"content":"Hello OneTee!"}'
    ```

- POST `/community/posts/{post_id}/like`
- POST `/community/posts/{post_id}/repost`
- POST `/community/posts/{post_id}/bookmark`
  - Auth required
  - Returns: `{ success: true }`

- GET `/community/posts/{post_id}`
  - Returns: thread with replies

- POST `/community/posts/{post_id}/reply`
  - Auth required
  - Body: `{ content }`

- GET `/community/profiles/{username}`
- GET `/community/profiles/{username}/posts`
  - Auth required

- GET `/community/activity/recent`
  - Auth required

- GET `/community/trending/tags`

- DELETE `/community/posts/{post_id}`
  - Auth required; only author can delete
  - Returns: `{ success: true }`
