"use client";
import { useState, useEffect } from "react";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, filename: string, alt: string) => void;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("video/"))
    return (
      <svg className="w-10 h-10 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H4zm14 2 4-2v12l-4-2V8z"/>
      </svg>
    );
  if (mimeType === "application/pdf")
    return (
      <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h8v1H8v-1zm0 3h5v1H8v-1zm0-6h3v1H8v-1z"/>
      </svg>
    );
  if (mimeType.includes("word") || mimeType.includes("document"))
    return (
      <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 11h8v1H8v-1zm0 3h8v1H8v-1zm0 3h5v1H8v-1z"/>
      </svg>
    );
  return (
    <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z"/>
    </svg>
  );
}

export default function MediaPickerModal({ open, onClose, onSelect }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/media${query ? `?q=${encodeURIComponent(query)}` : ""}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => { setMedia(data); setLoading(false); });
  }, [open, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Media Library</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="p-3 border-b border-gray-100">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {loading && <p className="text-sm text-gray-400 text-center py-8">Loading…</p>}
          {!loading && media.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No files found.</p>
          )}
          {!loading && media.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {media.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { onSelect(m.url, m.filename, m.alt ?? ""); onClose(); }}
                  className="group rounded-lg border-2 border-transparent hover:border-indigo-400 overflow-hidden text-left transition-all focus:outline-none focus:border-indigo-500"
                >
                  <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                    {m.mimeType.startsWith("image/") ? (
                      <img src={m.url} alt={m.alt ?? m.filename} className="w-full h-full object-cover" />
                    ) : (
                      <FileIcon mimeType={m.mimeType} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 px-1 py-1 truncate group-hover:text-indigo-600">{m.filename}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
