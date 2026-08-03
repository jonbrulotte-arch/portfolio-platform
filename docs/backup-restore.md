# Backup & Restore

The backup system creates compressed, encrypted snapshots of everything needed to fully restore the site: the SQLite database and all uploaded media files.

---

## What is backed up

| Included | Notes |
|---|---|
| SQLite database (`dev.db`) | All projects, pages, settings, categories, tags, media records |
| Uploaded files (`public/uploads/`) | All images and documents uploaded through the media library |

What is **not** included (and doesn't need to be):
- The application code — restore from Git
- `node_modules/` — restored with `npm install`
- `.env` — must be kept separately; contains secrets that should never be in a backup

---

## Encryption

Backups use **AES-256-CBC** encryption:

1. A random 16-byte salt and 16-byte IV are generated per backup
2. The encryption key is derived from `BACKUP_PASSPHRASE` using PBKDF2-SHA256 (100,000 iterations)
3. The archive is encrypted and stored as: `salt(16B) + IV(16B) + ciphertext`

**Keep `BACKUP_PASSPHRASE` safe.** If it's lost, existing `.enc` files cannot be decrypted.

---

## Creating a backup

### From the admin UI

1. **Admin → Backup → Create Backup**
2. The backup appears in the table below with its filename, size, and date

### From the command line

```bash
BACKUP_PASSPHRASE=yourpassphrase node scripts/backup-cron.js
```

Or if `BACKUP_PASSPHRASE` is set in `.env`:

```bash
node scripts/backup-cron.js
```

---

## Automated backups (cron)

Add to your crontab (`crontab -e`) to run a backup every day at 2 AM:

```cron
0 2 * * * cd /path/to/portfolio-platform && node scripts/backup-cron.js >> /var/log/portfolio-backup.log 2>&1
```

The script:
- Creates a new encrypted `.enc` backup in the `backups/` directory
- Prunes backups older than `BACKUP_RETAIN_DAYS` days (default: 30)
- Logs progress with timestamps to stdout/stderr

To keep backups for 90 days instead, set in `.env`:

```env
BACKUP_RETAIN_DAYS=90
```

---

## Downloading a backup

In **Admin → Backup**, click **Download** next to any backup. The `.enc` file is saved to your computer. Store it somewhere safe — cloud storage, an external drive, or a second server.

---

## Restoring from a stored backup

If a backup already exists on the server:

1. **Admin → Backup** — find the backup in the table
2. Click **Restore** → confirm the warning dialog
3. The database and uploads directory are replaced with the backup contents
4. Restart the Next.js process for all changes to take effect

```bash
sudo systemctl restart portfolio
# or if using PM2:
pm2 restart portfolio
```

---

## Migrating to a new server

Use this process to move the site to a new machine with zero data loss.

### Step 1 — Back up the old server

On the old server, create a fresh backup:

1. **Admin → Backup → Create Backup**
2. Click **Download** to save the `.enc` file locally

### Step 2 — Set up the new server

On the new server, follow the [Installation guide](./installation.md) up through `npm install`. **Do not run the seed** — you'll restore real data instead.

Make sure `.env` contains the **same `BACKUP_PASSPHRASE`** as the old server. Without it the backup cannot be decrypted.

### Step 3 — Restore

1. On the new server, run `npm run build && npm start` to start the app
2. Log in with the default credentials (`admin@example.com` / `admin123` — these are from the fresh DB, before restore)
3. **Admin → Backup → Restore from File**
4. Click **Choose .enc file…** and select the backup downloaded in Step 1
5. Click **Import & Restore** → confirm
6. Restart the process

```bash
sudo systemctl restart portfolio
```

The site now has all the original data, settings, and uploaded files.

---

## Deleting old backups

In **Admin → Backup**, click **Delete** next to any backup you no longer need. The `.enc` file is permanently removed from the server. Automated pruning via `BACKUP_RETAIN_DAYS` handles this automatically for scheduled backups.

---

## Troubleshooting

### "BACKUP_PASSPHRASE is not set"

Add `BACKUP_PASSPHRASE=yourpassphrase` to your `.env` file and restart the server.

### "Cannot locate SQLite database"

The backup script reads `DATABASE_URL` from `.env` to find the database file. Make sure `DATABASE_URL` is set and points to an existing file (e.g. `file:./dev.db`).

### "bad decrypt" or decryption error on restore

The passphrase used to restore does not match the one used to create the backup. Ensure `BACKUP_PASSPHRASE` in `.env` on the new server matches the value from the old server.

### Restore completes but data looks stale

Next.js caches some responses in memory. Restart the process after a restore to clear in-memory state.
