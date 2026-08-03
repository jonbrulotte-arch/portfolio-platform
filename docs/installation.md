# Installation & Configuration

## Requirements

- **Node.js** 18 or later
- **npm** 9 or later
- A Linux/macOS server (or Windows with WSL) for production

---

## Installation

### 1. Get the code

```bash
git clone <your-repo-url> portfolio-platform
cd portfolio-platform
npm install
```

### 2. Environment variables

All configuration lives in `.env` at the project root. An example is committed to the repo. Edit it before running anything:

```env
# Prisma / SQLite
DATABASE_URL="file:./dev.db"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="replace-with-a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"

# Backup encryption — use a strong passphrase and keep it safe
# If you lose this, existing backup files cannot be decrypted
BACKUP_PASSPHRASE="replace-with-a-long-random-string"

# Days to keep automated backups before pruning (default 30)
BACKUP_RETAIN_DAYS=30
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite file path. Use `file:./dev.db` for default location at project root |
| `NEXTAUTH_SECRET` | Yes | Random string used to sign session tokens |
| `NEXTAUTH_URL` | Yes | Full public URL of the site (used by NextAuth redirects) |
| `BACKUP_PASSPHRASE` | Yes (for backups) | Encryption key for `.enc` backup files |
| `BACKUP_RETAIN_DAYS` | No | Auto-prune backups older than N days (default: 30) |

### 3. Database setup

Run migrations then seed default data:

```bash
npx prisma migrate deploy
npx prisma db seed
```

This creates:
- Admin account `admin@example.com` / `admin123` — change this immediately
- Default site settings (site name, tagline, etc.)
- Sample categories, tags, and an example project

### 4. Create the uploads directory

```bash
mkdir -p public/uploads
```

The directory is git-ignored but must exist for file uploads to work. It is created automatically on first upload if missing.

---

## Running

### Development

```bash
npm run dev
```

Hot-reloads on file changes. Open [http://localhost:3000](http://localhost:3000).

### Production

```bash
npm run build
npm start
```

The default port is 3000. To use a different port:

```bash
PORT=8080 npm start
```

---

## Running behind a reverse proxy (Nginx)

A typical Nginx config to proxy the app on port 3000:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP → HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 50M;  # allow large file uploads

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Set `NEXTAUTH_URL` to your HTTPS domain after enabling SSL.

---

## Running as a systemd service

Create `/etc/systemd/system/portfolio.service`:

```ini
[Unit]
Description=Sympl CMS
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/home/youruser/portfolio-platform
ExecStart=/usr/bin/node node_modules/.bin/next start
Restart=on-failure
RestartSec=5
EnvironmentFile=/home/youruser/portfolio-platform/.env

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable portfolio
sudo systemctl start portfolio
```

---

## Updating

```bash
git pull
npm install
npx prisma migrate deploy
npm run build
sudo systemctl restart portfolio   # or however you manage the process
```

---

## Changing the admin password

Log in to the admin dashboard → **Settings** → update the **Email** and use the password reset flow, or update the database directly:

```bash
node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-new-password', 12);
console.log(hash);
"
```

Then update the hash in the database using `npx prisma studio` or a SQLite client.
