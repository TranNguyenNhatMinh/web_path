Code đang dùng 2 token:

- Access token (JWT): frontend lưu trong localStorage key accessToken, gửi lên backend qua header
Authorization: Bearer <accessToken>
→ dùng để vào các API CRUD.

- Refresh token (JWT): backend set vào cookie HttpOnly refreshToken
→ dùng để xin access token mới khi access token hết hạn (POST /auth/refresh).

