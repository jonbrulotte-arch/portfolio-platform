"use client";
import { useState, useEffect, useRef } from "react";

const EMOJI_GROUPS = [
  { label: "Tech", emojis: ["💻","🖥️","📱","⌨️","🖱️","🖨️","💾","💿","📡","🔌","🔋","📲","🤖","🧠","⚡","🔧","🔩","⚙️","🛠️","🔬"] },
  { label: "Web", emojis: ["🌐","🌍","🔗","📡","🛜","📶","🔒","🔓","🛡️","🌊","🔍","📊","📈","📉","🗂️","📂","📁","🗃️","🗄️","📋"] },
  { label: "Dev", emojis: ["⌨️","📝","✏️","🖊️","📄","📃","📜","🗒️","🧾","🔐","🔑","🗝️","🔏","📌","📍","🚀","🛸","🏗️","🧱","🔭"] },
  { label: "Design", emojis: ["🎨","🖌️","🖍️","✏️","📐","📏","🎭","🎬","🎥","📷","📸","🖼️","🎞️","🎨","🌈","✨","💡","🔦","🕯️","🔆"] },
  { label: "Data", emojis: ["📊","📈","📉","🗃️","🗄️","💾","🗂️","📋","📑","📰","📓","📔","📒","📕","📗","📘","📙","🔢","🔣","🧮"] },
  { label: "People", emojis: ["👤","👥","🧑‍💻","👨‍💻","👩‍💻","🧑‍🎨","🧑‍🔬","🧑‍🏫","🧑‍🔧","👷","🧑‍💼","🤝","🫂","🧩","🎯","🏆","🥇","🎖️","🏅","⭐"] },
  { label: "Misc", emojis: ["🔥","💎","🌟","⚡","🎉","🎊","🎁","🎈","🎀","🏷️","📦","📫","📬","📭","📮","🗳️","📥","📤","📩","✉️"] },
];

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number;
}

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", description: "", color: "#6366f1", icon: "", sortOrder: 0 });
  const [editing, setEditing] = useState<Category | null>(null);
  const [msg, setMsg] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiTab, setEmojiTab] = useState(0);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setEmojiOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" }).then((r) => r.json()).then(setCats);
  }, []);

  async function save() {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      setCats((prev) =>
        editing ? prev.map((c) => c.id === editing.id ? updated : c) : [...prev, updated]
      );
      setForm({ name: "", description: "", color: "#6366f1", icon: "", sortOrder: 0 });
      setEditing(null);
      setMsg("Saved!");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) setCats((prev) => prev.filter((c) => c.id !== id));
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description ?? "", color: cat.color ?? "#6366f1", icon: cat.icon ?? "", sortOrder: cat.sortOrder });
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categories</h1>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">{editing ? `Edit: ${editing.name}` : "Add Category"}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Web Apps" />
          </div>
          <div ref={emojiRef} className="relative">
            <label className="text-xs text-gray-600 block mb-1">Icon (emoji)</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEmojiOpen((v) => !v)}
                className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 min-w-[80px]"
              >
                <span className="text-xl leading-none">{form.icon || "?"}</span>
                <span className="text-gray-400 text-xs">Pick</span>
              </button>
              {form.icon && (
                <button type="button" onClick={() => setForm({ ...form, icon: "" })} className="text-xs text-gray-400 hover:text-red-500 px-2">✕</button>
              )}
            </div>
            {emojiOpen && (
              <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
                <div className="flex gap-1 mb-2 flex-wrap">
                  {EMOJI_GROUPS.map((g, i) => (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => setEmojiTab(i)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${emojiTab === i ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-10 gap-0.5">
                  {EMOJI_GROUPS[emojiTab].emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { setForm({ ...form, icon: emoji }); setEmojiOpen(false); }}
                      className={`text-xl p-1 rounded hover:bg-indigo-50 transition-colors leading-none ${form.icon === emoji ? "bg-indigo-100" : ""}`}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-9 rounded border border-gray-300 cursor-pointer" />
              <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputCls} placeholder="#6366f1" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })} className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-600 block mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            {editing ? "Update" : "Add Category"}
          </button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm({ name: "", description: "", color: "#6366f1", icon: "", sortOrder: 0 }); }}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
          )}
          {msg && <span className="text-sm text-green-600 self-center">{msg}</span>}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {cats.length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {cats.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: cat.color ? `${cat.color}30` : "#e0e7ff" }}>
                    {cat.icon || "⊹"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                    {cat.description && <p className="text-xs text-gray-400">{cat.description}</p>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => startEdit(cat)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => remove(cat.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
