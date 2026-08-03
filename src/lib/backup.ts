import { execSync } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const BACKUP_DIR = path.join(ROOT, "backups");
// DATABASE_URL is "file:./dev.db" — the file lives at the project root
const DB_PATH = path.join(ROOT, "dev.db");
const UPLOADS_DIR = path.join(ROOT, "public", "uploads");

const ALGO = "aes-256-cbc";
const KEY_LEN = 32;
const IV_LEN = 16;
const SALT_LEN = 16;
const ITERATIONS = 100_000;

function getPassphrase(): string {
  const p = process.env.BACKUP_PASSPHRASE;
  if (!p) throw new Error("BACKUP_PASSPHRASE env variable is not set");
  return p;
}

function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LEN, "sha256");
}

export function ensureBackupDir() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export interface BackupEntry {
  filename: string;
  size: number;
  createdAt: string;
}

export function listBackups(): BackupEntry[] {
  ensureBackupDir();
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".enc"))
    .map((f) => {
      const stat = fs.statSync(path.join(BACKUP_DIR, f));
      return { filename: f, size: stat.size, createdAt: stat.birthtime.toISOString() };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createBackup(): string {
  ensureBackupDir();
  const passphrase = getPassphrase();

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const tarPath = path.join(BACKUP_DIR, `backup-${ts}.tar.gz`);
  const encPath = tarPath.replace(".tar.gz", ".enc");

  // Create tar archive of DB + uploads
  execSync(
    `tar -czf "${tarPath}" -C "${path.dirname(DB_PATH)}" "${path.basename(DB_PATH)}" -C "${path.dirname(UPLOADS_DIR)}" "${path.basename(UPLOADS_DIR)}"`,
    { stdio: "pipe" }
  );

  // Encrypt: salt(16) + iv(16) + ciphertext
  const plaintext = fs.readFileSync(tarPath);
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const key = deriveKey(passphrase, salt);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  fs.writeFileSync(encPath, Buffer.concat([salt, iv, encrypted]));

  fs.unlinkSync(tarPath);
  return path.basename(encPath);
}

export function restoreBackup(filename: string): void {
  const passphrase = getPassphrase();
  const encPath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(encPath)) throw new Error("Backup file not found");
  if (!filename.endsWith(".enc")) throw new Error("Invalid backup file");

  const encData = fs.readFileSync(encPath);
  const salt = encData.subarray(0, SALT_LEN);
  const iv = encData.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const ciphertext = encData.subarray(SALT_LEN + IV_LEN);
  const key = deriveKey(passphrase, salt);

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  const tarPath = encPath.replace(".enc", ".tar.gz");
  fs.writeFileSync(tarPath, plaintext);

  // Clear uploads dir contents (keep directory)
  if (fs.existsSync(UPLOADS_DIR)) {
    for (const f of fs.readdirSync(UPLOADS_DIR)) {
      if (f !== ".gitkeep") fs.rmSync(path.join(UPLOADS_DIR, f), { recursive: true });
    }
  }

  // Extract: restores dev.db and uploads/ in place
  execSync(`tar -xzf "${tarPath}" -C "${ROOT}" "${path.basename(DB_PATH)}" && tar -xzf "${tarPath}" -C "${path.dirname(UPLOADS_DIR)}" "${path.basename(UPLOADS_DIR)}"`, { stdio: "pipe" });

  fs.unlinkSync(tarPath);
}

export function deleteBackup(filename: string): void {
  if (!filename.endsWith(".enc")) throw new Error("Invalid backup file");
  const p = path.join(BACKUP_DIR, filename);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

export function readBackupFile(filename: string): Buffer {
  if (!filename.endsWith(".enc")) throw new Error("Invalid backup file");
  return fs.readFileSync(path.join(BACKUP_DIR, filename));
}
