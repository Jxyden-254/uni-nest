# UNI-NEST API Documentation

Base URL (development): `http://localhost:5000`

Authenticated endpoints require the header:

```
Authorization: Bearer <token>
```

## Health

| Method | Endpoint      | Description                 |
| ------ | ------------- | --------------------------- |
| GET    | `/api/health` | Confirms the API is running |

## Authentication (`/api/auth`)

| Method | Endpoint                    | Auth  | Description                                                                                                                                         |
| ------ | --------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/register`        | No    | Create an account. Body: `name`, `email`, `password`, optional `role` (`STUDENT`, `LANDLORD`, `UNIVERSITY`, `COMPANY`). Sends a verification email. |
| POST   | `/api/auth/login`           | No    | Body: `email`, `password`. Returns `{ token, user }`.                                                                                               |
| POST   | `/api/auth/logout`          | No    | Stateless logout — the client discards its token.                                                                                                   |
| GET    | `/api/auth/verify-email`    | No    | Query: `token` (from the verification email).                                                                                                       |
| POST   | `/api/auth/forgot-password` | No    | Body: `email`. Sends a reset link (valid 1 hour).                                                                                                   |
| POST   | `/api/auth/reset-password`  | No    | Body: `token`, `password`.                                                                                                                          |
| POST   | `/api/auth/google`          | No    | Body: `idToken` (Google Sign-In ID token). Creates or links an account. Requires `GOOGLE_CLIENT_ID` on the server.                                  |
| GET    | `/api/auth/me`              | Yes   | Returns the logged-in user.                                                                                                                         |
| GET    | `/api/auth/admin/ping`      | ADMIN | Example role-protected route.                                                                                                                       |

### Example

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com","password":"supersecret1"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"supersecret1"}'

# Use the token
curl http://localhost:5000/api/auth/me -H "Authorization: Bearer <token>"
```

### Seeded test accounts

All seeded users have password `password123`:

| Email                          | Role       |
| ------------------------------ | ---------- |
| admin@uninest.com              | ADMIN      |
| james.landlord@example.com     | LANDLORD   |
| grace@primestudentliving.co.ke | COMPANY    |
| office@ntu.ac.ke               | UNIVERSITY |
| alice.student@example.com      | STUDENT    |
| brian.student@example.com      | STUDENT    |

### Notes

- Passwords are hashed with bcrypt (10 salt rounds).
- JWTs are signed with `JWT_SECRET` and expire after 7 days.
- In development (no `SMTP_HOST` set), emails are printed to the server console
  so verification/reset links can be copied from the terminal.
