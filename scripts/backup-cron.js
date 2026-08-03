#!/usr/bin/env node
/**
 * Backup cron script — run directly with Node or from crontab:
 *
 *   # Daily at 2 AM
 *   0 2 * * * cd /path/to/portfolio-platform && node scripts/backup-cron.js >> /var/log/portfolio-backup.log 2>&1
 *
 * Required env variable: BACKUP_PASSPHRASE
 * Optional: BACKUP_RETAIN_DAYS (default 30) — deletes backups older than N days
 *
 * Loads .env automatically if present.
 */

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { execSync } = require("child_process");

// ---------------------------------------------------------------------------
// Load .env
// ---------------------------------------------------------------------------
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ROOT = path.join(__dirname, "..");
const BACKUP_DIR = path.join(ROOT, "backups");
const DB_PATH = path.join(ROOT, "dev.db");
const UPLOADS_DIR = path.join(ROOT, "public", "uploads");
const RETAIN_DAYS = parseInt(process.env.BACKUP_RETAIN_DAYS ?? "30", 10);

const ALGO = "aes-256-cbc";
const KEY_LEN = 32;
const IV_LEN = 16;
const SALT_LEN = 16;
const ITERATIONS = 100_000;

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function getPassphrase() {
  const p = process.env.BACKUP_PASSPHRASE;
  if (!p) throw new Error("BACKUP_PASSPHRASE is not set");
  return p;
}

function deriveKey(passphrase, salt) {
  return crypto.pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LEN, "sha256");
}

// ---------------------------------------------------------------------------
// Create backup
// ---------------------------------------------------------------------------
function createBackup() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const passphrase = getPassphrase();
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const tarPath = path.join(BACKUP_DIR, `backup-${ts}.tar.gz`);
  const encPath = tarPath.replace(".tar.gz", ".enc");

  execSync(
    `tar -czf "${tarPath}" -C "${path.dirname(DB_PATH)}" "${path.basename(DB_PATH)}" -C "${path.dirname(UPLOADS_DIR)}" "${path.basename(UPLOADS_DIR)}"`,
    { stdio: "pipe" }
  );
  log(`Archive created: ${path.basename(tarPath)}`);

  const plaintext = fs.readFileSync(tarPath);
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const key = deriveKey(passphrase, salt);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  fs.writeFileSync(encPath, Buffer.concat([salt, iv, encrypted]));
  fs.unlinkSync(tarPath);

  const sizeMB = (fs.statSync(encPath).size / 1024 / 1024).toFixed(2);
  log(`Encrypted backup saved: ${path.basename(encPath)} (${sizeMB} MB)`);
  return encPath;
}

// ---------------------------------------------------------------------------
// Prune old backups
// ---------------------------------------------------------------------------
function pruneOldBackups() {
  const cutoff = Date.now() - RETAIN_DAYS * 24 * 60 * 60 * 1000;
  let pruned = 0;
  for (const f of fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".enc"))) {
    const fp = path.join(BACKUP_DIR, f);
    if (fs.statSync(fp).mtimeMs < cutoff) {
      fs.unlinkSync(fp);
      log(`Pruned old backup: ${f}`);
      pruned++;
    }
  }
  if (pruned === 0) log("No old backups to prune.");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
try {
  log("Starting backup…");
  createBackup();
  pruneOldBackups();
  log("Backup complete.");
  process.exit(0);
} catch (err) {
  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
  process.exit(1);
}
