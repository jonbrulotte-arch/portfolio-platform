"use client";
import { useState, useEffect, useRef } from "react";

interface Media {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt: string | null;
  createdAt: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => fetch("/api/media").then((r) => r.json()).then(setMedia);
  useEffect(() => { load(); }, []);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      await fetch("/api/media", { method: "POST", body: fd });
    }
    await load();
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function remove(id: string) {
    if (!confirm("Delete this file?")) return;
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (res.ok) setMedia((prev) => prev.filter((m) => m.id !== id));
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  const images = media.filter((m) => m.mimeType.startsWith("image/"));
  const other = media.filter((m) => !m.mimeType.startsWith("image/"));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media</h1>
        <label className={`cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}>
          {uploading ? "Uploading…" : "Upload Files"}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={upload}
            disabled={uploading}
          />
        </label>
      </div>

      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-6 cursor-pointer hover:border-indigo-300 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <p className="text-gray-400 text-sm">Drop files here or click to upload</p>
      </div>

      {images.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Images ({images.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((m) => (
              <div
                key={m.id}
                className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selected === m.id ? "border-indigo-500" : "border-transparent hover:border-gray-300"}`}
                onClick={() => setSelected(selected === m.id ? null : m.id)}
              >
                <div className="aspect-square bg-gray-100">
                  <img src={m.url} alt={m.alt ?? m.filename} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(m.url); }}
                    className="w-full text-xs bg-white text-gray-900 rounded px-2 py-1 hover:bg-gray-100"
                  >
                    {copied === m.url ? "Copied!" : "Copy URL"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(m.id); }}
                    className="w-full text-xs bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-xs text-gray-500 p-1 truncate">{m.filename}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {other.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Files ({other.length})</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {other.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.filename}</p>
                  <p className="text-xs text-gray-400">{m.mimeType} · {formatSize(m.size)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyUrl(m.url)} className="text-xs text-indigo-600 hover:underline">Copy URL</button>
                  <button onClick={() => remove(m.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {media.length === 0 && (
        <div className="text-center py-12 text-gray-400">No files uploaded yet.</div>
      )}
    </div>
  );
}
