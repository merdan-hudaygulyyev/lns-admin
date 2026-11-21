# LNS Admin — full-stack members CRUD

A complete admin panel for managing `members`, with a separate Node/Express/TypeScript API and a Next.js/TypeScript frontend.

## What is included

| Area | Details |
| --- | --- |
| Backend | Node.js, Express 4, TypeScript, PostgreSQL, bcrypt, JWT, multer, helmet, cors, morgan, dotenv, Zod |
| Frontend | Next.js 16, TypeScript, Tailwind 3, TanStack Query, Formik + yup, axios, next-themes, next-intl, react-hot-toast |
| Database | PostgreSQL database `admin`, tables `admins` and `members` |
| Security | JWT access token in an httpOnly `admin_token` cookie; all API routes protected except login; bcrypt hashes; AES-256-GCM encrypted passports; HMAC blind index for passport search |
| Languages | `tk` = Turkish, `ru` = Russian, `tm` = Turkmenistan/Turkmen |
| Delivery | Local npm scripts, Docker Compose, GitHub, Vercel frontend, external backend host, custom domain |

Default local login:

```text
Email/username: admin
Password:       Admin@12345
```

Local URLs:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:4000/api/v1
Health:   http://localhost:4000/api/v1/health
Uploads:  http://localhost:4000/uploads/<filename>
Database: postgresql://postgres:postgres@localhost:5432/admin
```

---

## 1. Folder structure

```text
LNS project/
├─ docker-compose.yml          # Postgres + backend + frontend
├─ .gitignore
├─ README.md                   # this file
├─ backend/
│  ├─ Dockerfile
│  ├─ .dockerignore
│  ├─ .env                     # local config (gitignored)
│  ├─ .env.example
│  ├─ sql/
│  │  ├─ 00_create_database.sql
│  │  └─ 01_schema.sql
│  ├─ src/
│  │  ├─ config/               # env validation
│  │  ├─ controllers/          # HTTP layer
│  │  ├─ database/             # pg pool
│  │  ├─ middleware/           # auth, validate, upload, errors
│  │  ├─ repositories/         # SQL queries
│  │  ├─ routes/               # /auth, /members, /health
│  │  ├─ schemas/              # Zod request schemas
│  │  ├─ scripts/              # migrate + seed
│  │  ├─ services/             # business logic, hashing, encryption
│  │  ├─ utils/                # responses, crypto, image helpers
│  │  ├─ app.ts
│  │  └─ server.ts
│  └─ package.json
└─ frontend/
   ├─ Dockerfile
   ├─ .dockerignore
   ├─ .env                     # local public config (gitignored)
   ├─ .env.example
   ├─ messages/
   │  ├─ tk.json               # Turkish
   │  ├─ ru.json               # Russian
   │  └─ tm.json               # Turkmen
   ├─ src/
   │  ├─ app/
   │  │  ├─ [locale]/          # login, members, new, details, edit, profile
   │  │  ├─ api/               # axios client + typed services
   │  │  ├─ components/        # forms, tables, modals, shell
   │  │  ├─ compLibrary/       # reusable Input, Button, Card, Select
   │  │  └─ utils/             # formatting, routes
   │  ├─ i18n/                 # routing, request config, navigation
   │  └─ middleware.ts         # auth guard + next-intl
   └─ package.json
```

See also:

- [`backend/README.md`](backend/README.md) — API reference and backend notes.
- [`frontend/README.md`](frontend/README.md) — frontend/i18n notes.

---

## 2. Local development without Docker

### Prerequisites

- Node.js 22 (Node 20+ also works)
- npm
- PostgreSQL 14+ running on `localhost:5432`
- A PostgreSQL user/password (the default config uses `postgres` / `postgres`)

### 2.1 Create the database

From `psql`, DBeaver (see section 3), or any SQL client, run:

```sql
CREATE DATABASE admin;
```

If the database already exists, skip this.

### 2.2 Start the backend

```powershell
cd backend
npm install
copy .env.example .env   # if .env is missing; adjust values if needed
npm run typecheck
npm run db:migrate
npm run db:seed
npm run dev
```

Expected output includes:

```text
Database schema is up to date
Default admin seeded { email: 'admin@example.com', ... }
API listening on http://localhost:4000/api/v1
```

Check in another terminal:

```powershell
curl.exe http://localhost:4000/api/v1/health
```

Expected:

```json
{"success":true,"data":{"status":"ok","time":"..."}}
```

### 2.3 Start the frontend

```powershell
cd frontend
npm install
copy .env.example .env   # if .env is missing
npm run typecheck
npm run dev
```

Open <http://localhost:3000/login>.

> **Windows/SWC note:** the scripts already use `next dev --webpack` and `next build --webpack`. If you reinstall `node_modules` and Next.js reports a missing SWC binary, see [Troubleshooting](#12-troubleshooting).

---

## 3. Create and inspect the database in DBeaver Desktop

The Docker stack publishes Postgres on `localhost:5432`, so these steps work for both local npm development and Docker.

### 3.1 Connect to the maintenance database

1. Open **DBeaver**.
2. Click **Database → New Database Connection** (or the plug icon).
3. Select **PostgreSQL** and click **Next**.
4. Fill in:

   | Field | Value |
   | --- | --- |
   | Server | `localhost` |
   | Port | `5432` |
   | Database | `postgres` |
   | Username | `postgres` |
   | Password | `postgres` (or your `POSTGRES_PASSWORD`) |

5. Click **Test Connection**. If it fails, make sure Postgres/Docker is running and the password matches.
6. Click **Finish**.

### 3.2 Create the `admin` database

1. With the `postgres` connection selected, open **SQL Editor → New SQL script**.
2. Paste the contents of [`backend/sql/00_create_database.sql`](backend/sql/00_create_database.sql):

   ```sql
   CREATE DATABASE admin;
   ```

3. Click **Execute Script** (or press `Ctrl+Shift+Enter`).
4. If DBeaver says the database already exists, that is fine.

### 3.3 Create the tables

1. Create a second connection to the new `admin` database (same host/user/password, database `admin`). You can also edit the first connection and change its database to `admin`.
2. Open a new SQL script on the `admin` connection.
3. Paste the contents of [`backend/sql/01_schema.sql`](backend/sql/01_schema.sql) and execute it.
   - Alternatively run `npm run db:migrate` from `backend/`; it executes the same schema.
4. Refresh **Database Navigator**.

You should now see:

```text
admin
├─ Tables
│  ├─ admins
│  └─ members
└─ Types
   └─ members_currency
```

### 3.4 Seed the default admin

From `backend/`:

```powershell
npm run db:seed
```

Or, with Docker, the backend container runs this automatically at startup.

### 3.5 View data

In DBeaver:

- Right-click `admins` → **View Data**, or run:

  ```sql
  SELECT id, email, username, full_name, created_at FROM admins;
  ```

- Right-click `members` → **View Data**, or run:

  ```sql
  SELECT
    id,
    username,
    full_name,
    passport_number,
    passport_hash,
    amount,
    currency,
    image_path,       -- first gallery image (thumbnail)
    image_paths,      -- all images in display order
    created_at
  FROM members
  ORDER BY created_at DESC;
  ```

Useful checks:

```sql
SELECT COUNT(*) AS admin_count FROM admins;
SELECT COUNT(*) AS member_count FROM members;

SELECT username, full_name, amount, currency, registration_date
FROM members
WHERE currency = 'USD'
ORDER BY amount DESC;
```

**Important:** in DBeaver you will see:

- `password_hash`, `pin_code_hash`, `secret_answer_hash` — bcrypt hashes, never plaintext.
- `passport_number` — an AES-256-GCM encrypted envelope, not readable as plain text.
- `passport_hash` — an HMAC blind index used for exact passport search.

The full passport number is only revealed by the backend on `GET /members/:id`, which is what the member details page uses.

---

## 4. Run everything with Docker Compose

### 4.1 Start

Make sure Docker Desktop is running, then from the project root:

```powershell
docker compose config
docker compose up -d --build
```

The backend container automatically runs:

```text
npm run db:migrate:dist && npm run db:seed:dist && node dist/server.js
```

Check status and logs:

```powershell
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

Open:

- <http://localhost:3000/login>
- <http://localhost:4000/api/v1/health>

### 4.2 Useful commands

```powershell
# Stop without deleting data
docker compose down

# Start again
docker compose up -d

# Rebuild only one service
docker compose up -d --build backend
docker compose up -d --build frontend

# Destructive: delete database volume and uploaded images
docker compose down -v
```

### 4.3 Override defaults

Create a `.env` file in the **project root** (gitignored) if you want to change defaults:

```dotenv
POSTGRES_PASSWORD=your-strong-db-password
JWT_SECRET=a-long-random-secret-at-least-16-chars
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
PASSPORT_HASH_KEY=fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210
ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@12345
ADMIN_FULL_NAME=Default Administrator
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
COOKIE_DOMAIN=
COOKIE_SAME_SITE=lax
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_ORIGIN=http://localhost:4000
```

Generate real 64-hex keys with:

```powershell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Max 256 }) -as [byte[]]).ToLowerInvariant()
```

> The keys in `.env.example`/Compose are development defaults. Change them before any real deployment.

---

## 5. API endpoints

Base URL: `/api/v1`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Health check |
| `POST` | `/auth/login` | No | Login with `username` or `email` + `password`; sets `admin_token` cookie |
| `POST` | `/auth/logout` | Yes | Clears the cookie |
| `GET` | `/auth/me` | Yes | Returns the logged-in admin profile |
| `POST` | `/members` | Yes | Create member; multipart form with one or more `images` files |
| `GET` | `/members` | Yes | List members with search/filter/sort/pagination |
| `GET` | `/members/:id` | Yes | Get one member with full passport number and all image paths |
| `PUT` | `/members/:id` | Yes | Update member; optional new `images`, remove/reorder with `imageOrder` |
| `DELETE` | `/members/:id` | Yes | Delete member and all of its image files |

### `GET /members` query parameters

| Parameter | Example | Notes |
| --- | --- | --- |
| `page` | `1` | Default `1` |
| `limit` | `10` | `1`–`100`, default `10` |
| `search` | `A1234567` | Matches name, username, email, phone, passport blind index, etc. |
| `currency` | `USD` | `TL` or `USD` |
| `product` | `LNS Product` | Exact filter |
| `inviter` | `Admin` | Exact filter |
| `amountMin` / `amountMax` | `100` | Numeric range |
| `registrationFrom` / `registrationTo` | `2026-01-01` | `YYYY-MM-DD` |
| `birthFrom` / `birthTo` | `1990-01-01` | `YYYY-MM-DD` |
| `sortBy` | `amount` | `created_at`, `full_name`, `amount`, `registration_date` |
| `order` | `desc` | `asc` or `desc` |

All success responses have the shape:

```json
{ "success": true, "data": ..., "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 } }
```

---

## 6. Automated API smoke test (PowerShell)

This exercises health → login → me → create with two images → detail → masked search → update → filters → delete → logout → 401.

Run it after `docker compose up -d --build` (or with the local npm stack running).

```powershell
$ErrorActionPreference='Stop'
$base='http://localhost:4000/api/v1'
$jar=Join-Path $env:TEMP 'lns-api-cookies.txt'
$png=Join-Path $env:TEMP 'lns-test-member-1.png'
$png2=Join-Path $env:TEMP 'lns-test-member-2.png'
$bodyFile=Join-Path $env:TEMP 'lns-api-body.json'
$outFile=Join-Path $env:TEMP 'lns-api-out.json'
Remove-Item $jar,$png,$png2,$bodyFile,$outFile -ErrorAction SilentlyContinue

# 1x1 PNG with a valid signature for multer
$pngBytes=[Convert]::FromBase64String('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==')
[IO.File]::WriteAllBytes($png,$pngBytes)
[IO.File]::WriteAllBytes($png2,$pngBytes)

function Call([string]$method,[string]$url,[string]$json=$null){
  $args=@('-sS','-X',$method,'-b',$jar,'-c',$jar,'-H','Accept: application/json','-o',$outFile,'-w','%{http_code}')
  if($null -ne $json){
    [IO.File]::WriteAllText($bodyFile,$json)
    $args += @('-H','Content-Type: application/json','--data-binary',"@$bodyFile")
  }
  $args += $url
  $code=(& curl.exe @args | Select-Object -Last 1).Trim()
  $raw=[IO.File]::ReadAllText($outFile)
  $obj=if([string]::IsNullOrWhiteSpace($raw)){$null}else{$raw|ConvertFrom-Json}
  [pscustomobject]@{ Code=$code; Body=$obj }
}
function Show([string]$name,$r){
  Write-Output ("{0} [HTTP {1}]: {2}" -f $name,$r.Code,($r.Body|ConvertTo-Json -Depth 7 -Compress))
}

Show 'HEALTH' (Call 'GET' "$base/health")
Show 'LOGIN' (Call 'POST' "$base/auth/login" '{"username":"admin","password":"Admin@12345"}')
Show 'ME' (Call 'GET' "$base/auth/me")
Show 'LIST_BEFORE' (Call 'GET' "$base/members?page=1&limit=5")

$fields=[ordered]@{
  username='test.member'; password='Member@12345'; fullName='Test Member'; motherName='Test Mother'; heir='Test Heir';
  passportNumber='A1234567'; birthDate='1990-05-15'; secretQuestion='Favorite color?'; secretAnswer='blue';
  email='test.member@example.com'; pinCode='1234'; phone='+905551234567'; inviter='Admin'; product='LNS Product';
  address='Test Address 1'; postalIndex='12345'; officialSite='https://example.com'; registrationDate='2026-01-10';
  amount='1250.50'; currency='USD'
}
$curlArgs=@('-sS','-X','POST','-b',$jar,'-c',$jar,'-H','Accept: application/json','-o',$outFile,'-w','%{http_code}')
foreach($k in $fields.Keys){ $curlArgs += @('-F',"$k=$($fields[$k])") }
$curlArgs += @(
  '-F',"images=@$png;type=image/png",
  '-F',"images=@$png2;type=image/png",
  '-F','imageOrder=["new:0","new:1"]',
  "$base/members"
)
$code=(& curl.exe @curlArgs | Select-Object -Last 1).Trim()
$created=([IO.File]::ReadAllText($outFile)|ConvertFrom-Json)
Show 'CREATE' ([pscustomobject]@{Code=$code;Body=$created})

$id=$created.data.id
Show 'DETAIL_FULL_PASSPORT' (Call 'GET' "$base/members/$id")
Show 'LIST_MASKED_PASSPORT' (Call 'GET' "$base/members?search=A1234567&limit=5")
Show 'UPDATE' (Call 'PUT' "$base/members/$id" '{"fullName":"Updated Test Member","amount":2000,"currency":"TL"}')
Show 'FILTER_SORT' (Call 'GET' "$base/members?currency=TL&product=LNS%20Product&amountMin=1000&sortBy=amount&order=desc&limit=5")
Show 'DELETE' (Call 'DELETE' "$base/members/$id")
Show 'GET_AFTER_DELETE' (Call 'GET' "$base/members/$id")
Show 'LOGOUT' (Call 'POST' "$base/auth/logout" '{}')
Show 'LIST_AFTER_LOGOUT' (Call 'GET' "$base/members")
```

### Expected results

| Check | Expected |
| --- | --- |
| Health | `200`, `"status":"ok"` |
| Login | `200`, token and admin returned, cookie saved |
| `/auth/me` | `200`, admin profile |
| Create | `201`, new id, masked passport, two `imagePaths` |
| Detail | `200`, full passport `A1234567`, two gallery images |
| Search by passport | `200`, one result, passport masked |
| Update | `200`, changed fields returned |
| Filter/sort | `200`, one result |
| Delete | `200` |
| Get after delete | `404 Member not found` |
| Logout | `200` |
| List after logout | `401 Authentication required` |

---

## 7. Manual frontend test checklist

### 7.1 Languages

Open these URLs and confirm the UI language:

| URL | Language | Example text |
| --- | --- | --- |
| <http://localhost:3000/login> | Turkish (`tk`) | `Giriş yap` |
| <http://localhost:3000/ru/login> | Russian (`ru`) | `Войти` |
| <http://localhost:3000/tm/login> | Turkmen (`tm`) | `Girmek` |

The language switcher in the header must offer **Türkçe**, **Русский**, and **Türkmençe**. Switching language should keep you on the same page (for example `/members` → `/tm/members`).

Validation messages, toasts, table headers, filters, empty states, and error messages are translated in all three files.

### 7.2 Auth and protection

1. While logged out, open `/members` → redirects to `/login`.
2. Open `/ru/members` → redirects to `/ru/login`.
3. Open `/tm/profile` → redirects to `/tm/login`.
4. Log in with `admin` / `Admin@12345`.
5. Successful login redirects to `/members`.
6. While logged in, opening `/login` redirects to `/members`.
7. Open `/profile` and confirm only the profile card is visible (no page title/description) with admin id, email, full name, and created date.
8. Click **Logout** and confirm protected pages redirect again.

### 7.3 Members CRUD

1. **List** — open `/members`. Check columns, avatar thumbnails, amount formatting, and dates.
2. **Search** — type a username, email, phone, or passport number; results should narrow.
3. **Filters** — open filters; test currency, product, inviter, amount min/max, and date ranges.
4. **Sort** — change sort field and ascending/descending.
5. **Pagination** — change rows per page and move between pages.
6. **Create** — open `/members/new`:
   - submit empty form → translated validation errors appear under fields;
   - fill all required fields and select several JPG/PNG files at once (or drag them in);
   - use the arrows to reorder thumbnails and the × button to remove one;
   - submit → success toast and redirect to `/members`;
   - verify the new row appears and its passport is masked.
7. **Details** — click the eye icon:
   - full passport is shown only here;
   - every uploaded image appears in the gallery;
   - hovering a thumbnail enlarges it visually; clicking opens the lightbox;
   - arrow keys or buttons move between images, Escape closes.
8. **Edit** — open `/members/:id/edit`:
   - leave password, PIN, and secret answer blank to keep them unchanged;
   - add more images, remove existing ones, or reorder the gallery;
   - change amount/product and save → success toast.
9. **Delete** — click delete:
   - cancel → nothing happens;
   - confirm → success toast and the row disappears.
10. **Theme** — switch between light, dark, and system; check sidebar, cards, table, and modal colors.
11. **DBeaver check** — refresh the `members` table and confirm the new/updated/deleted row and that hashes remain hashes.

---

## 8. Push to GitHub

This project is already a Git repository and `origin` points to `https://github.com/merdan-hudaygulyyev/lns-admin.git`. For any later change, run from the project root:

```powershell
git status --short
git add .
git commit -m "Add multi-image gallery and profile layout"
git push origin main
```

If you clone it on another machine for the first time:

```powershell
git clone https://github.com/merdan-hudaygulyyev/lns-admin.git
cd lns-admin
```

`.gitignore` files already exclude `node_modules`, `.next`, `dist`, `.env`, and uploaded files. Only source, examples, Docker files, SQL, and documentation are committed.

If you want to verify before committing:

```powershell
git status --short
git check-ignore backend\.env frontend\.env
```

---

## 9. Deploy to Vercel + a backend host

Vercel is ideal for the Next.js frontend. The Express API is a long-running server with a local Postgres connection and file uploads, so host it on a Node-friendly platform such as **Render**, **Railway**, **Fly.io**, **Cloud Run**, or a VPS.

### 9.1 Deploy the backend first

Example for Render (other hosts are similar):

| Setting | Value |
| --- | --- |
| Build command | `npm ci && npm run build` |
| Start command | `npm run db:migrate:dist && npm run db:seed:dist && npm run start` |
| Root directory | `backend` |
| Node version | 22 |
| Database | Managed Postgres; copy its external `DATABASE_URL` |
| Disk | Add a persistent disk and mount it at the upload directory (for example `/app/uploads`), or move uploads to object storage |

Backend production environment variables:

```dotenv
NODE_ENV=production
PORT=4000
API_PREFIX=/api/v1
DATABASE_URL=postgresql://user:pass@host:5432/admin
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=45m
ENCRYPTION_KEY=<64-hex-chars>
PASSPORT_HASH_KEY=<different-64-hex-chars>
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://admin.example.com
COOKIE_DOMAIN=.example.com
COOKIE_SAME_SITE=lax
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<change-me>
ADMIN_FULL_NAME=Default Administrator
```

> `COOKIE_DOMAIN=.example.com` is needed when the frontend is `admin.example.com` and the API is `api.example.com`: it makes the httpOnly cookie visible to both subdomains. Keep `COOKIE_SAME_SITE=lax` for sibling subdomains. Use `none` only for genuinely cross-site setups (and only over HTTPS).

### 9.2 Deploy the frontend to Vercel

1. In Vercel click **Add New → Project** and import your GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Next.js**.
4. Build command: `npm run build`
   - The scripts use `next build --webpack` for portability.
5. Add environment variables:

   ```dotenv
   NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
   NEXT_PUBLIC_API_ORIGIN=https://api.example.com
   ```

   `NEXT_PUBLIC_*` values are baked into the build, so redeploy after changing them.

6. Click **Deploy**.

### 9.3 Alternative: same-origin API with a Vercel rewrite

If you do not want to expose a second domain for the API, add `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.example.com/api/:path*" },
    { "source": "/uploads/:path*", "destination": "https://api.example.com/uploads/:path*" }
  ]
}
```

Then set:

```dotenv
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_API_ORIGIN=https://admin.example.com
```

and leave backend `COOKIE_DOMAIN` empty so the cookie is set on the frontend host. This also lets image URLs work through `https://admin.example.com/uploads/...`.

---

## 10. Custom domain and DNS

### Frontend on Vercel

1. Vercel project → **Settings → Domains → Add**.
2. Add `admin.example.com` (a subdomain is easiest).
3. In your DNS provider add:

   ```text
   Type: CNAME
   Name: admin
   Value: cname.vercel-dns.com
   ```

   For an apex domain (`example.com`), Vercel usually asks for an `A` record to `76.76.21.21`.

4. Wait for Vercel to issue an SSL certificate (status becomes **Valid Configuration**).

### Backend API

1. Point `api.example.com` at your backend host (usually a CNAME provided by Render/Railway/Fly/etc.).
2. Make sure that host has HTTPS enabled.
3. Update `CORS_ORIGIN=https://admin.example.com` and `COOKIE_DOMAIN=.example.com` on the backend.
4. Update `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_API_ORIGIN` on Vercel and redeploy.

### Final production checks

```text
https://admin.example.com/login        → Turkish login page
https://admin.example.com/ru/login     → Russian login page
https://admin.example.com/tm/login     → Turkmen login page
https://api.example.com/api/v1/health  → {"success":true,...}
```

Then repeat the full [manual frontend checklist](#7-manual-frontend-test-checklist) on the real domain, including login, create/edit/delete, passport masking, image loading, locale switching, and theme switching.

---

## 11. Production environment variable reference

### Backend

| Variable | Required | Example / notes |
| --- | --- | --- |
| `NODE_ENV` | yes | `production` |
| `PORT` | no | `4000` |
| `API_PREFIX` | no | `/api/v1` |
| `DATABASE_URL` | yes | External managed Postgres URL |
| `JWT_SECRET` | yes | ≥16 chars; long random value |
| `JWT_EXPIRES_IN` | no | `45m` |
| `ENCRYPTION_KEY` | yes | Exactly 64 hex chars (AES-256-GCM) |
| `PASSPORT_HASH_KEY` | yes | Exactly 64 hex chars, different from `ENCRYPTION_KEY` |
| `BCRYPT_ROUNDS` | no | `12`–`16` |
| `CORS_ORIGIN` | yes | Comma-separated frontend origins; include every host you open, e.g. `http://localhost:3000,http://127.0.0.1:3000` |
| `COOKIE_DOMAIN` | no | Empty locally; `.example.com` for sibling subdomains |
| `COOKIE_SAME_SITE` | no | `lax`, `none`, or `strict` |
| `UPLOAD_DIR` | no | `uploads`; must be on persistent storage |
| `MAX_FILE_SIZE_MB` | no | `10` per image |
| `MAX_IMAGES_PER_MEMBER` | no | `20` images per member (1–100) |
| `ADMIN_EMAIL` / `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_FULL_NAME` | yes for seed | Change the default password |

### Frontend

| Variable | Example | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.example.com/api/v1` | Full API base URL, or `/api/v1` with a Vercel rewrite |
| `NEXT_PUBLIC_API_ORIGIN` | `https://api.example.com` | Used to build image URLs; use the frontend origin with a rewrite |

---

## 12. Troubleshooting

| Problem | Fix |
| --- | --- |
| `docker compose` says daemon is not running | Start Docker Desktop and wait until the engine is ready, then rerun `docker compose up -d --build`. |
| Port `3000`, `4000`, or `5432` already in use | Stop the conflicting service or change the published ports in `docker-compose.yml`. |
| DBeaver cannot connect | Use host `localhost`, port `5432`, database `admin`, user `postgres`, password from `POSTGRES_PASSWORD`. Run `docker compose ps` to confirm Postgres is Up/healthy. |
| Login works on localhost but not after deployment | Check `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`, `COOKIE_DOMAIN`, and `COOKIE_SAME_SITE`. For `admin.example.com` + `api.example.com`, use `COOKIE_DOMAIN=.example.com`. |
| Browser says “Method not allowed by Access-Control-Allow-Methods” or CORS status `(null)` | Confirm the backend container is running, then make sure the exact frontend origin (including `127.0.0.1` vs `localhost` and the port) is listed in `CORS_ORIGIN`. Restart the backend after changing it. |
| Redirect loop to `/login` in production | The frontend middleware looks for the `admin_token` cookie on the frontend host. Use a shared cookie domain or the Vercel rewrite approach in section 9.3. |
| Images do not load | Check `NEXT_PUBLIC_API_ORIGIN`, the backend `/uploads` static route, and persistent storage for uploads. |
| `npm run build` fails with “Failed to load SWC binary” on Windows | The native binary is optional. Install it manually: `npm pack @next/swc-win32-x64-msvc@16.4.6`, extract the tarball into `frontend/node_modules/@next/swc-win32-x64-msvc`, then rerun `npm run build`. Alternatively set `$env:NEXT_TEST_WASM_DIR="<project>\frontend\node_modules\@next\swc-wasm-nodejs"` and use the webpack scripts. |
| “middleware file convention is deprecated” warning | Harmless in Next 16.4; `src/middleware.ts` still works. A future migration can rename it to `proxy`. |
| Need a completely fresh database | `docker compose down -v` deletes the Postgres volume and uploads, then `docker compose up -d --build` recreates and reseeds everything. |
