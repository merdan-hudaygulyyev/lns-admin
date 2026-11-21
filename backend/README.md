# LNS Admin API

Express + TypeScript REST API for the LNS admin panel. See the [root README](../README.md) for complete setup, DBeaver, Docker, GitHub, Vercel, and testing instructions.

## Stack

- Express 4, TypeScript, Zod validation
- PostgreSQL with `pg` and parameterized queries
- bcrypt password/PIN/secret-answer hashing
- JWT in an httpOnly `admin_token` cookie
- AES-256-GCM passport encryption + HMAC-SHA256 blind index
- multer memory storage with MIME + magic-byte image checks
- helmet, cors, cookie-parser, morgan, dotenv

## Scripts

```powershell
npm install
npm run typecheck          # tsc --noEmit
npm run build              # -> dist/
npm run dev                # ts-node-dev, reloads on change
npm run start              # node dist/server.js
npm run db:migrate         # create database objects (ts-node)
npm run db:seed            # seed default admin (ts-node)
npm run db:migrate:dist    # same, from dist/ (used by Docker)
npm run db:seed:dist       # same, from dist/ (used by Docker)
```

## Environment

Copy `.env.example` to `.env` and adjust. Important variables:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/admin
JWT_SECRET=change-this-to-a-long-random-value
ENCRYPTION_KEY=<64-hex-chars>
PASSPORT_HASH_KEY=<different-64-hex-chars>
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
COOKIE_DOMAIN=
COOKIE_SAME_SITE=lax
```

`COOKIE_DOMAIN` is empty for local development. For `admin.example.com` + `api.example.com`, set `COOKIE_DOMAIN=.example.com`. See the root README deployment section.

## API

Base URL: `/api/v1`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Health check |
| `POST` | `/auth/login` | No | Login, sets `admin_token` httpOnly cookie |
| `POST` | `/auth/logout` | Yes | Clears the cookie |
| `GET` | `/auth/me` | Yes | Logged-in admin profile |
| `POST` | `/members` | Yes | Create member (multipart, one or more `images`) |
| `GET` | `/members` | Yes | List/search/filter/sort/paginate members |
| `GET` | `/members/:id` | Yes | Get member with full passport and all image paths |
| `PUT` | `/members/:id` | Yes | Update member; optional new `images`, optional `imageOrder` |
| `DELETE` | `/members/:id` | Yes | Delete member and all uploaded images |

List query parameters:

```text
page, limit, search, currency, product, inviter,
amountMin, amountMax, registrationFrom, registrationTo,
birthFrom, birthTo, sortBy, order
```

`sortBy` accepts `created_at | full_name | amount | registration_date`; `order` accepts `asc | desc`.

### Image upload contract

- Send one or more `images` file parts (the old single `image` part is still accepted).
- `imageOrder` is a JSON string array describing the final gallery order:
  - `existing:/uploads/uuid.png` keeps a saved image;
  - `new:0`, `new:1`, … refer to uploaded files in the order they were sent.
- Omitted existing paths are removed; every new file must appear exactly once.
- `image_path` stores the first image for list thumbnails; `image_paths` stores the ordered gallery.

## Project structure

```text
src/
├─ config/env.ts            # Zod-validated environment
├─ database/pool.ts         # pg Pool
├─ middleware/              # auth, validation, upload, errors, logging
├─ schemas/                 # request validation
├─ repositories/            # SQL only
├─ services/                # hashing, encryption, image lifecycle
├─ controllers/             # thin HTTP handlers
├─ routes/                  # route composition
├─ scripts/                 # migrate + seed
├─ app.ts
└─ server.ts
```

The layering is strictly `routes → controllers → services → repositories`. Serialization happens in `services/members.service.ts` (`toMemberDto`), which is the only place that turns a database row into an API response. Hashes are never returned.

## Data model

Database: `admin`. Tables: `admins`, `members`. SQL lives in `sql/`.

- All member fields are required at the database level.
- `password_hash`, `pin_code_hash`, and `secret_answer_hash` are bcrypt hashes.
- `passport_number` stores an encrypted `base64(iv):base64(authTag):base64(ciphertext)` envelope.
- `passport_hash` is an HMAC blind index used for exact search without decrypting every row.
- `amount` is `NUMERIC(12,2)` with `amount > 0`; `currency` is an enum `TL | USD`.
- `updated_at` is maintained by triggers.

## Default admin

`npm run db:seed` creates this account only if it does not already exist:

```text
email:    admin@example.com
username: admin
password: Admin@12345
```

Change `ADMIN_PASSWORD` before deployment.

## Docker

The root `docker-compose.yml` builds this Dockerfile and runs:

```sh
npm run db:migrate:dist && npm run db:seed:dist && node dist/server.js
```

Uploads are stored in `/app/uploads`, mounted as a named Docker volume. In production, use persistent storage or object storage.
