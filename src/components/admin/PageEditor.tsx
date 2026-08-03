"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  inNav: boolean;
  navOrder: number;
  seoTitle: string;
  seoDesc: string;
  ogImage: string;
  heroImage: string;
  heroImageAlt: string;
  scheduledAt: string;
}

export default function PageEditor({ initialData }: { initialData?: Partial<PageData> & { id?: string } }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "media" | "seo">("content");
  const [mediaPicker, setMediaPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PageData>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    content: initialData?.content ?? "",
    status: initialData?.status ?? "draft",
    inNav: initialData?.inNav ?? false,
    navOrder: initialData?.navOrder ?? 0,
    seoTitle: initialData?.seoTitle ?? "",
    seoDesc: initialData?.seoDesc ?? "",
    ogImage: initialData?.ogImage ?? "",
    heroImage: initialData?.heroImage ?? "",
    heroImageAlt: initialData?.heroImageAlt ?? "",
    scheduledAt: initialData?.scheduledAt ?? "",
  });

  const set = <K extends keyof PageData>(key: K, value: PageData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function uploadHero(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const m = await res.json();
      setForm((f) => ({ ...f, heroImage: m.url, heroImageAlt: f.heroImageAlt || m.alt || file.name }));
    } finally {
      setUploading(false);
    }
  }

  async function save(publishNow = false) {
    setSaving(true);
    setSaveMsg("");
    const payload = { ...form };
    if (publishNow) payload.status = "published";

    const url = initialData?.id ? `/api/pages/${initialData.id}` : "/api/pages";
    const method = initialData?.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSaveMsg("Saved!");
      if (!initialData?.id) router.push(`/admin/pages/${data.id}`);
    } catch (e: any) {
      setSaveMsg("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deletePage() {
    if (!initialData?.id) return;
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/pages/${initialData.id}`, { method: "DELETE" });
    router.push("/admin/pages");
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{initialData?.id ? "Edit Page" : "New Page"}</h1>
          {saveMsg && <p className={`text-sm mt-1 ${saveMsg.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>{saveMsg}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={saving} className="px-4 py-2 text-sm border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 disabled:opacity-50">
            Save Draft
          </button>
          {form.status !== "published" ? (
            <button onClick={() => save(true)} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving…" : "Publish"}
            </button>
          ) : (
            <button onClick={() => save(false)} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="mb-4">
              <label className={labelCls}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => { set("title", e.target.value); if (!initialData?.id) set("slug", slugify(e.target.value)); }}
                className={inputCls + " text-lg font-medium"}
                placeholder="Page title"
              />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input type="text" value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls + " font-mono text-xs"} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              {(["content", "media", "seo"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px capitalize ${activeTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>
                  {tab === "media" ? "Hero Image" : tab === "seo" ? "SEO" : "Content"}
                </button>
              ))}
            </div>
            <div className="p-5">
              {activeTab === "content" && (
                <div>
                  <label className={labelCls}>Page Content</label>
                  <MarkdownEditor
                    value={form.content}
                    onChange={(v) => set("content", v)}
                    rows={20}
                    placeholder="# Page Title&#10;&#10;Write your page content in Markdown..."
                  />
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">An optional banner image shown at the top of the page.</p>

                  {/* Image preview */}
                  {form.heroImage && (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-[3/1] bg-gray-100">
                      <img src={form.heroImage} alt={form.heroImageAlt || "Hero image"} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setForm((f) => ({ ...f, heroImage: "", heroImageAlt: "" }))}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/80 text-sm"
                        aria-label="Remove hero image"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Upload / Browse / URL */}
                  <div className="flex gap-2 flex-wrap">
                    <input
                      ref={uploadRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadHero(f); e.target.value = ""; }}
                    />
                    <button
                      onClick={() => uploadRef.current?.click()}
                      disabled={uploading}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      {uploading ? "Uploading…" : "Upload Image"}
                    </button>
                    <button
                      onClick={() => setMediaPicker(true)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Browse Library
                    </button>
                  </div>

                  <div>
                    <label className={labelCls}>Image URL</label>
                    <input
                      type="url"
                      value={form.heroImage}
                      onChange={(e) => set("heroImage", e.target.value)}
                      className={inputCls}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Alt Text <span className="text-red-500">*</span> <span className="text-xs text-gray-400 font-normal">(required for accessibility)</span></label>
                    <input
                      type="text"
                      value={form.heroImageAlt}
                      onChange={(e) => set("heroImageAlt", e.target.value)}
                      className={inputCls}
                      placeholder="Describe the image for screen readers"
                    />
                  </div>
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>SEO Title</label>
                    <input type="text" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>SEO Description</label>
                    <textarea value={form.seoDesc} onChange={(e) => set("seoDesc", e.target.value)} rows={3} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>OG Image URL</label>
                    <input type="url" value={form.ogImage} onChange={(e) => set("ogImage", e.target.value)} className={inputCls} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
            <div className="space-y-3">
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
                <option value="scheduled">Scheduled</option>
              </select>
              {form.status === "scheduled" && (
                <input type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} className={inputCls} />
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.inNav} onChange={(e) => set("inNav", e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Show in navigation</span>
              </label>
              {form.inNav && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Nav order</label>
                  <input type="number" value={form.navOrder} onChange={(e) => set("navOrder", +e.target.value)} className={inputCls} />
                </div>
              )}
            </div>
          </div>

          {initialData?.id && (
            <div className="bg-white rounded-xl border border-red-200 p-4">
              <h3 className="text-sm font-semibold text-red-700 mb-3">Danger Zone</h3>
              <button onClick={deletePage} className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50">Delete Page</button>
            </div>
          )}
        </div>
      </div>

      <MediaPickerModal
        open={mediaPicker}
        onClose={() => setMediaPicker(false)}
        onSelect={(url, filename, alt) => {
          setForm((f) => ({ ...f, heroImage: url, heroImageAlt: f.heroImageAlt || alt || filename }));
          setMediaPicker(false);
        }}
      />
    </div>
  );
}
