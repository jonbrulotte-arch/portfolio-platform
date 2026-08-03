"use client";
import { useState, useEffect } from "react";

interface Tag { id: string; name: string; slug: string }

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/tags", { cache: "no-store" }).then((r) => r.json()).then(setTags);
  }, []);

  async function add() {
    if (!name.trim()) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      const tag = await res.json();
      setTags((prev) => [...prev, tag]);
      setName("");
      setMsg("Added!");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete tag?")) return;
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
    if (res.ok) setTags((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tags</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Add Tag</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Tag name"
          />
          <button onClick={add} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Add</button>
          {msg && <span className="text-sm text-green-600 self-center">{msg}</span>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {tags.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No tags yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-700">
                {tag.name}
                <button onClick={() => remove(tag.id)} className="ml-1 text-gray-400 hover:text-red-500 text-xs">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
