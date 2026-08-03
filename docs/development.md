# Development Guide

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server Components, API Routes, route groups |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | Utility-first, no component library |
| Database | SQLite via Prisma 5 | Single-file DB, zero external deps |
| Auth | NextAuth v4 | Credentials provider, JWT sessions |
| Passwords | bcryptjs | Cost factor 12 |
| Encryption | Node.js `crypto` | AES-256-CBC, PBKDF2 |

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (sets <title> and meta)
│   ├── (public)/                   # Public site route group
│   │   ├── layout.tsx              # Nav + footer (force-dynamic)
│   │   ├── page.tsx                # Homepage
│   │   ├── projects/
│   │   │   ├── page.tsx            # Projects index with filters
│   │   │   └── [slug]/page.tsx     # Project detail
│   │   └── [slug]/page.tsx         # Dynamic content pages
│   ├── admin/
│   │   ├── login/page.tsx          # Login (outside auth gate)
│   │   └── (protected)/            # Auth-gated admin route group
│   │       ├── layout.tsx          # Auth check + sidebar (force-dynamic)
│   │       ├── page.tsx            # Dashboard
│   │       ├── projects/           # Project CRUD
│   │       ├── pages/              # Page CRUD
│   │       ├── categories/         # Category CRUD
│   │       ├── tags/               # Tag CRUD
│   │       ├── media/              # Media library
│   │       ├── backup/             # Backup & Restore
│   │       └── settings/           # Site settings
│   └── api/
│       ├── auth/[...nextauth]/     # NextAuth handler
│       ├── projects/               # Projects REST API
│       ├── pages/                  # Pages REST API
│       ├── categories/             # Categories REST API
│       ├── tags/                   # Tags REST API
│       ├── media/                  # Media upload/list/delete
│       ├── settings/               # Settings get/set
│       └── backup/                 # Backup create/list/download/restore
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx        # Sidebar nav (client)
│   │   ├── ProjectEditor.tsx       # Full project editor (client)
│   │   ├── PageEditor.tsx          # Page editor (client)
│   │   ├── MarkdownEditor.tsx      # Toolbar + preview Markdown editor
│   │   ├── MediaPickerModal.tsx    # Reusable media library picker
│   │   └── SessionProvider.tsx     # NextAuth SessionProvider wrapper
│   └── public/
│       ├── SiteNav.tsx             # Responsive nav with logo support
│       └── ProjectCard.tsx         # Project card component
└── lib/
    ├── prisma.ts                   # PrismaClient singleton
    ├── auth.ts                     # NextAuth options
    ├── settings.ts                 # Site settings helpers
    ├── backup.ts                   # Backup/restore logic
    └── utils.ts                    # cn(), slugify(), formatDate(), etc.
```

---

## Key patterns

### Caching

Next.js aggressively caches server components and API routes. The project uses two mechanisms to ensure fresh data:

**`export const dynamic = "force-dynamic"`** — added to:
- The admin `(protected)` layout (covers all admin pages)
- All API GET routes
- Public pages that must reflect live DB state (`(public)/layout.tsx`, `[slug]/page.tsx`)

**`revalidatePath()`** — called in every mutating API route after a write to bust cached rendered pages. For example, publishing a project calls `revalidatePath("/projects/my-slug")` and `revalidatePath("/projects", "layout")`.

### Auth gating

The route group `admin/(protected)/` has an auth-checking layout that calls `getServerSession()` and redirects to `/admin/login` if there's no session. The login page lives outside this group at `admin/login/` so it doesn't trigger the auth check.

### Settings

Site-wide settings are stored as key-value rows in the `SiteSetting` table. `getSettings()` in `src/lib/settings.ts` merges DB values with in-memory defaults so unset keys always have a value. New settings need a default added there.

### Media

Uploaded files are saved to `public/uploads/` with a `Date.now()`-prefixed random filename to avoid collisions. The DB stores the `/uploads/filename` URL. The `public/` directory is served statically by Next.js.

---

## Database schema (summary)

```
User            — admin accounts
Project         — portfolio projects
  ProjectTag    — join: Project ↔ Tag
  ProjectVersion — version snapshots (JSON blob)
  Screenshot    — project images
  ProjectLink   — external links
Category        — project categories
Tag             — project tags
Page            — content pages
  PageVersion   — version snapshots
Media           — uploaded file records
SiteSetting     — key-value site config
```

Run `npx prisma studio` to browse the database in a web UI.

---

## Adding a new setting

1. Add the key to `SETTING_KEYS` in `src/lib/settings.ts`
2. Add a default value to the `defaults` map in the same file
3. Add a field entry to the `SECTIONS` array in `src/app/admin/(protected)/settings/page.tsx`

Supported field types: `text`, `email`, `url`, `textarea`, `color`, `toggle`, `logo`.

---

## Adding a new admin page

1. Create `src/app/admin/(protected)/your-section/page.tsx`
2. Add a nav entry to the `nav` array in `src/components/admin/AdminSidebar.tsx`
3. The auth layout is inherited automatically — no extra auth code needed

---

## Environment variables reference

| Variable | Description |
|---|---|
| `DATABASE_URL` | Prisma SQLite connection string, e.g. `file:./dev.db` |
| `NEXTAUTH_SECRET` | Random secret for signing JWT session tokens |
| `NEXTAUTH_URL` | Full public URL (e.g. `https://yourdomain.com`) |
| `BACKUP_PASSPHRASE` | Encryption key for `.enc` backup files |
| `BACKUP_RETAIN_DAYS` | Days to retain automated backups (default: 30) |

---

## Useful commands

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Production build
npm start                # Start production server
npx prisma studio        # Open DB browser UI
npx prisma migrate dev   # Create and apply a migration in development
npx prisma migrate deploy # Apply pending migrations in production
npx prisma db seed       # Re-run the seed (adds defaults, doesn't wipe)
node scripts/backup-cron.js  # Run a manual backup
```
