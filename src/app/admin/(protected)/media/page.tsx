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

  const load = () => fetch("/api/media", { cache: "no-store" }).then((r) => r.json()).then(setMedia);
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {other.map((m) => (
              <div
                key={m.id}
                className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selected === m.id ? "border-indigo-500" : "border-transparent hover:border-gray-300"}`}
                onClick={() => setSelected(selected === m.id ? null : m.id)}
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center">
                  {m.mimeType.startsWith("video/") && (
                    <svg className="w-10 h-10 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H4zm14 2 4-2v12l-4-2V8z"/>
                    </svg>
                  )}
                  {m.mimeType === "application/pdf" && (
                    <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h8v1H8v-1zm0 3h5v1H8v-1zm0-6h3v1H8v-1z"/>
                    </svg>
                  )}
                  {(m.mimeType.includes("word") || m.mimeType.includes("document")) && (
                    <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 11h8v1H8v-1zm0 3h8v1H8v-1zm0 3h5v1H8v-1z"/>
                    </svg>
                  )}
                  {!m.mimeType.startsWith("video/") && m.mimeType !== "application/pdf" && !m.mimeType.includes("word") && !m.mimeType.includes("document") && (
                    <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z"/>
                    </svg>
                  )}
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

      {media.length === 0 && (
        <div className="text-center py-12 text-gray-400">No files uploaded yet.</div>
      )}
    </div>
  );
}
