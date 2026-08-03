"use client";
import { useState, useEffect } from "react";
import { slugify } from "@/lib/utils";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  sortOrder: number;
  _count: { posts: number };
}

export default function AdminBlogCategoriesPage() {
  const [cats, setCats] = useState<BlogCategory[]>([]);
  const [form, setForm] = useState({ name: "", color: "#6366f1", sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  async function load() {
    const data = await fetch("/api/blog/categories").then((r) => r.json());
    setCats(data);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const url = editing ? `/api/blog/categories/${editing}` : "/api/blog/categories";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", color: "#6366f1", sortOrder: 0 });
    setEditing(null);
    setSaving(false);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/blog/categories/${id}`, { method: "DELETE" });
    await load();
  }

  function startEdit(cat: BlogCategory) {
    setEditing(cat.id);
    setForm({ name: cat.name, color: cat.color || "#6366f1", sortOrder: cat.sortOrder });
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blog Categories</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">{editing ? "Edit Category" : "Add Category"}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Category name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-10 h-9 rounded border border-gray-300 cursor-pointer" />
              <input type="text" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: +e.target.value }))} className={inputCls} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={!form.name || saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? "Saving…" : editing ? "Update" : "Add Category"}
          </button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm({ name: "", color: "#6366f1", sortOrder: 0 }); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {cats.length === 0 && <div className="p-8 text-center text-gray-400">No categories yet.</div>}
        {cats.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 px-5 py-3">
            {cat.color && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />}
            <div className="flex-1">
              <span className="font-medium text-gray-900">{cat.name}</span>
              <span className="ml-2 text-xs text-gray-400">/{cat.slug}</span>
            </div>
            <span className="text-xs text-gray-400">{cat._count.posts} post{cat._count.posts !== 1 ? "s" : ""}</span>
            <button onClick={() => startEdit(cat)} className="text-xs text-indigo-600 hover:underline">Edit</button>
            <button onClick={() => remove(cat.id)} className="text-xs text-red-500 hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
