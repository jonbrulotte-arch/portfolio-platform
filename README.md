# Sympl CMS

A self-hosted personal portfolio CMS with a full administrative backend. Manage projects, pages, media, categories, tags, and site settings through a secure admin dashboard. Ships as a single Next.js application backed by SQLite — no external services required.

---

## Features

**Public site**
- Homepage with toggleable hero, category bar, featured projects, and recent projects sections
- Projects index with category/tag sidebar filters and keyword search
- Full project detail pages: Markdown description, screenshots gallery, embed code (live demos), links sidebar, tech stack, dev status badges
- Dynamic content pages (About, Contact, etc.) with Markdown editor
- Responsive navigation with optional site logo

**Admin dashboard**
- Secure login with bcrypt-hashed credentials
- Project editor: tabbed interface (Content / Media / Links / Embed / SEO), version snapshots, publish / draft / schedule / archive workflow
- Markdown editor with formatting toolbar and Write/Preview toggle
- Media library: image thumbnails, file-type icons (PDF, Word, video), upload, copy URL, delete
- Media picker modal usable from any editor — browse, search, and select
- Direct image upload from the project editor media tab
- Pages, Categories, Tags, Settings management
- Site logo upload with alt text for accessibility
- Backup & Restore with AES-256-CBC encryption

**Backup system**
- Creates compressed, encrypted `.enc` backup files containing the database and all uploaded media
- Create, download, restore, and delete backups from the admin UI
- Import a `.enc` file from another server for zero-downtime migration
- Standalone cron script for automated scheduled backups with configurable retention

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma 5 |
| Auth | NextAuth v4 (credentials + JWT) |
| Passwords | bcryptjs |
| Encryption | Node.js `crypto` (AES-256-CBC, PBKDF2) |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### 1. Clone and install

```bash
git clone <your-repo-url> portfolio-platform
cd portfolio-platform
npm install
```

### 2. Configure environment

Copy `.env` and fill in your values:

```bash
cp .env .env.local   # optional — .env is already read by Next.js
```

Edit `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
BACKUP_PASSPHRASE="<long random string — keep this safe>"
BACKUP_RETAIN_DAYS=30
```

> **Production**: set `NEXTAUTH_URL` to your public domain and use a strong random value for `NEXTAUTH_SECRET` and `BACKUP_PASSPHRASE`.

### 3. Set up the database

```bash
npx prisma migrate deploy
npx prisma db seed
```

The seed creates:
- Admin account: `admin@example.com` / `admin123` — **change this immediately**
- Default site settings
- Sample categories and tags
- One example project

### 4. Run

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) for the public site.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

---

## Documentation

Detailed guides live in the [`docs/`](./docs/) directory:

| Guide | Description |
|---|---|
| [Installation & Configuration](./docs/installation.md) | Full setup, environment variables, deployment |
| [Admin Guide](./docs/admin-guide.md) | Using the dashboard: projects, pages, media, settings |
| [Backup & Restore](./docs/backup-restore.md) | Creating backups, cron automation, server migration |
| [Development](./docs/development.md) | Project structure, adding features, database schema |

---

## Directory Structure

```
portfolio-platform/
├── backups/               # Encrypted backup files (.enc) — git-ignored
├── docs/                  # Documentation
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Prisma migrations
│   └── seed.ts            # Seed data
├── public/
│   └── uploads/           # User-uploaded media — git-ignored
├── scripts/
│   └── backup-cron.js     # Standalone backup script for cron
└── src/
    ├── app/
    │   ├── (public)/      # Public-facing pages
    │   ├── admin/
    │   │   ├── login/     # Login page (outside auth gate)
    │   │   └── (protected)/  # Auth-gated admin pages
    │   └── api/           # API route handlers
    ├── components/
    │   ├── admin/         # Admin UI components
    │   └── public/        # Public UI components
    └── lib/               # Shared utilities (auth, prisma, settings, backup)
```

---

## Default Credentials

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Password | `admin123` |

Change these immediately after first login via **Admin → Settings**.

---

## License

MIT
