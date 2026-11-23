# LNS Admin frontend

Next.js 16 + TypeScript admin UI. See the [root README](../README.md) for complete setup, testing, Docker, GitHub, Vercel, and custom-domain instructions.

## Scripts

```powershell
npm install
npm run typecheck
npm run dev       # next dev --webpack
npm run build     # next build --webpack
npm run start     # next start
npm run lint
```

The `--webpack` flag is intentional: this project avoids Turbopack because native bindings are not available on every development machine. Tailwind 3 uses `darkMode: "class"` with `next-themes`.

## Environment

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_ORIGIN=http://localhost:4000
```

`NEXT_PUBLIC_API_ORIGIN` is used to turn backend paths like `/uploads/photo.png` into full image URLs. On Vercel, set these before building/redeploying.

## Pages

| Route | Page |
| --- | --- |
| `/login` | Login |
| `/members` | Members list with search, filters, sort, and pagination |
| `/members/new` | Create member with image upload |
| `/members/[id]` | Member details; the only page that reveals the full passport |
| `/members/[id]/edit` | Edit member |
| `/admins` | Admin list with an add modal and table (super admin only) |
| `/profile` | Logged-in admin profile with username and role |

All pages except login are protected by `src/middleware.ts`, which checks the `admin_token` cookie and then delegates to `next-intl`.

## Languages

| Locale code | Language | Message file | URL prefix |
| --- | --- | --- | --- |
| `tk` | Turkish | `messages/tk.json` | none (default) |
| `ru` | Russian | `messages/ru.json` | `/ru` |
| `tm` | Turkmenistan / Turkmen | `messages/tm.json` | `/tm` |
| `uz` | Uzbekistan / Uzbek | `messages/uz.json` | `/uz` |

`localePrefix: "as-needed"` means Turkish uses clean URLs (`/login`, `/members`), while Russian, Turkmen, and Uzbek use prefixes (`/ru/login`, `/tm/login`, `/uz/login`).

Date and number formatting uses a small mapping in `src/i18n/routing.ts`:

- project `tk` (Turkish) and `tm` (Turkmen) → Intl `tr`
- project `uz` (Uzbek) → Intl `uz-UZ`, with fixed Uzbek month names
- `ru` stays `ru`

All four message files have identical key sets, including translated validation messages, toasts, table headers, filters, empty/error states, and form hints.

## Key components

```text
src/
├─ app/api/
│  ├─ axiosInstance.ts       # base URL, credentials, 401 redirect
│  └─ services/              # typed auth/members/profile calls
├─ app/components/
│  ├─ AppShell/              # sidebar + header + theme/language/profile menus
│  ├─ MembersPageContent/    # list, filters, pagination, delete modal
│  ├─ AdminsContent/         # admin table + top-right add button
│  ├─ AddAdminModal/         # Formik + yup create dialog (admin role only)
│  ├─ MemberForm/            # Formik + yup create/edit form
│  ├─ MemberDetailsContent/
│  ├─ MembersTable/
│  └─ ImageDropzone/
├─ app/compLibrary/          # Button, Input, Select, Card, Modal
├─ i18n/                     # routing, request config, navigation helpers
└─ middleware.ts
```

The axios client uses `withCredentials: true`. On a global 401 it clears the session through the backend logout endpoint and redirects to the localized login page.

## Windows SWC troubleshooting

If a fresh `npm install` leaves Next.js without its native SWC binary:

```powershell
npm pack @next/swc-win32-x64-msvc@16.4.6 --pack-destination "$env:TEMP"
New-Item -ItemType Directory -Force -Path node_modules\@next\swc-win32-x64-msvc | Out-Null
tar -xzf "$env:TEMP\next-swc-win32-x64-msvc-16.4.6.tgz" -C node_modules\@next\swc-win32-x64-msvc --strip-components=1
npm run build
```

Alternatively, use the installed WASM fallback:

```powershell
$env:NEXT_TEST_WASM_DIR = "$PWD\node_modules\@next\swc-wasm-nodejs"
npm run build
```

The Dockerfile installs Linux binaries normally and needs none of these workarounds.
