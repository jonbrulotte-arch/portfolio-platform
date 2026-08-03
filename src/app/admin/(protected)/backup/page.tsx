"use client";
import { useState, useEffect } from "react";

interface BackupEntry {
  filename: string;
  size: number;
  createdAt: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function AdminBackupPage() {
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const load = () =>
    fetch("/api/backup", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => { setBackups(Array.isArray(data) ? data : []); setLoading(false); });

  useEffect(() => { load(); }, []);

  function flash(text: string, ok: boolean) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  }

  async function createBackup() {
    setCreating(true);
    const res = await fetch("/api/backup", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      flash(`Backup created: ${data.filename}`, true);
      load();
    } else {
      flash(`Error: ${data.error}`, false);
    }
    setCreating(false);
  }

  async function restore(filename: string) {
    if (!confirm(`Restore from "${filename}"?\n\nThis will overwrite the current database and all uploaded files. This cannot be undone.`)) return;
    setRestoring(filename);
    const res = await fetch(`/api/backup/${encodeURIComponent(filename)}`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      flash("Restore complete. You may need to restart the server for all changes to take effect.", true);
    } else {
      flash(`Restore failed: ${data.error}`, false);
    }
    setRestoring(null);
  }

  async function remove(filename: string) {
    if (!confirm(`Delete backup "${filename}"?`)) return;
    const res = await fetch(`/api/backup/${encodeURIComponent(filename)}`, { method: "DELETE" });
    if (res.ok) {
      setBackups((prev) => prev.filter((b) => b.filename !== filename));
      flash("Backup deleted.", true);
    } else {
      flash("Delete failed.", false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-sm text-gray-500 mt-1">
            Backups include the database and all uploaded files, compressed and AES-256 encrypted.
          </p>
        </div>
        <button
          onClick={createBackup}
          disabled={creating}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {creating ? "Creating…" : "Create Backup"}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      {/* Cron instructions */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Automated Backups (cron)</h2>
        <p className="text-xs text-gray-500 mb-3">
          Add this line to your crontab (<code className="bg-gray-100 px-1 rounded">crontab -e</code>) to run a backup daily at 2 AM.
          Set <code className="bg-gray-100 px-1 rounded">BACKUP_PASSPHRASE</code> in your <code className="bg-gray-100 px-1 rounded">.env</code> file first.
          Old backups are pruned automatically after 30 days (override with <code className="bg-gray-100 px-1 rounded">BACKUP_RETAIN_DAYS</code>).
        </p>
        <pre className="bg-gray-900 text-green-400 text-xs rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
{`0 2 * * * cd /path/to/portfolio-platform && node scripts/backup-cron.js >> /var/log/portfolio-backup.log 2>&1`}
        </pre>
      </div>

      {/* Backup list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Stored Backups ({backups.length})</h2>
        </div>

        {loading && <p className="text-sm text-gray-400 text-center py-8">Loading…</p>}

        {!loading && backups.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No backups yet. Click &ldquo;Create Backup&rdquo; to make one.</p>
        )}

        {!loading && backups.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Filename</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 hidden sm:table-cell">Size</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 hidden md:table-cell">Created</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {backups.map((b) => (
                <tr key={b.filename} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 break-all">{b.filename}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{formatSize(b.size)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{formatDate(b.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end items-center">
                      <a
                        href={`/api/backup/${encodeURIComponent(b.filename)}`}
                        download={b.filename}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => restore(b.filename)}
                        disabled={restoring === b.filename}
                        className="text-xs text-amber-600 hover:underline disabled:opacity-50"
                      >
                        {restoring === b.filename ? "Restoring…" : "Restore"}
                      </button>
                      <button
                        onClick={() => remove(b.filename)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
