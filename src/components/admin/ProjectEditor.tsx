"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

interface Category { id: string; name: string; slug: string }
interface Tag { id: string; name: string; slug: string }

interface ProjectData {
  id?: string;
  title: string;
  slug: string;
  shortDesc: string;
  description: string;
  status: string;
  devStatus: string;
  featured: boolean;
  sortOrder: number;
  categoryId: string;
  techStack: string[];
  repoUrl: string;
  liveUrl: string;
  embedCode: string;
  seoTitle: string;
  seoDesc: string;
  ogImage: string;
  scheduledAt: string;
  tagIds: string[];
  links: { id?: string; label: string; url: string; icon: string; sortOrder: number }[];
  screenshots: { id?: string; url: string; alt: string; caption: string; sortOrder: number }[];
}

interface Props {
  initialData?: Partial<ProjectData> & { id?: string };
  categories: Category[];
  tags: Tag[];
}

const DEV_STATUSES = ["active", "maintained", "experimental", "deprecated", "completed", "wip"];
const STATUSES = ["draft", "published", "archived", "scheduled"];

export default function ProjectEditor({ initialData, categories, tags }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "media" | "links" | "seo" | "embed">("content");
  const [techInput, setTechInput] = useState("");

  const [form, setForm] = useState<ProjectData>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    shortDesc: initialData?.shortDesc ?? "",
    description: initialData?.description ?? "",
    status: initialData?.status ?? "draft",
    devStatus: initialData?.devStatus ?? "active",
    featured: initialData?.featured ?? false,
    sortOrder: initialData?.sortOrder ?? 0,
    categoryId: initialData?.categoryId ?? "",
    techStack: initialData?.techStack ?? [],
    repoUrl: initialData?.repoUrl ?? "",
    liveUrl: initialData?.liveUrl ?? "",
    embedCode: initialData?.embedCode ?? "",
    seoTitle: initialData?.seoTitle ?? "",
    seoDesc: initialData?.seoDesc ?? "",
    ogImage: initialData?.ogImage ?? "",
    scheduledAt: initialData?.scheduledAt ?? "",
    tagIds: initialData?.tagIds ?? [],
    links: initialData?.links ?? [],
    screenshots: initialData?.screenshots ?? [],
  });

  const set = <K extends keyof ProjectData>(key: K, value: ProjectData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleTitleChange = (title: string) => {
    set("title", title);
    if (!initialData?.id) set("slug", slugify(title));
  };

  const addTech = () => {
    if (techInput.trim() && !form.techStack.includes(techInput.trim())) {
      set("techStack", [...form.techStack, techInput.trim()]);
      setTechInput("");
    }
  };

  const removeTech = (t: string) => set("techStack", form.techStack.filter((x) => x !== t));

  const toggleTag = (id: string) =>
    set("tagIds", form.tagIds.includes(id) ? form.tagIds.filter((x) => x !== id) : [...form.tagIds, id]);

  const addLink = () =>
    set("links", [...form.links, { label: "", url: "", icon: "", sortOrder: form.links.length }]);

  const removeLink = (i: number) =>
    set("links", form.links.filter((_, idx) => idx !== i));

  const updateLink = (i: number, field: string, value: string) =>
    set("links", form.links.map((l, idx) => idx === i ? { ...l, [field]: value } : l));

  const addScreenshot = () =>
    set("screenshots", [...form.screenshots, { url: "", alt: "", caption: "", sortOrder: form.screenshots.length }]);

  const removeScreenshot = (i: number) =>
    set("screenshots", form.screenshots.filter((_, idx) => idx !== i));

  const updateScreenshot = (i: number, field: string, value: string) =>
    set("screenshots", form.screenshots.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  async function save(publishNow = false) {
    setSaving(true);
    setSaveMsg("");
    const payload = { ...form };
    if (publishNow) payload.status = "published";

    const url = initialData?.id ? `/api/projects/${initialData.id}` : "/api/projects";
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
      if (!initialData?.id) router.push(`/admin/projects/${data.id}`);
    } catch (e: any) {
      setSaveMsg("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject() {
    if (!initialData?.id) return;
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await fetch(`/api/projects/${initialData.id}`, { method: "DELETE" });
    router.push("/admin/projects");
  }

  async function saveVersion() {
    if (!initialData?.id) return;
    const message = prompt("Version note (optional):");
    await fetch(`/api/projects/${initialData.id}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    setSaveMsg("Version saved!");
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: "content", label: "Content" },
    { id: "media", label: "Media" },
    { id: "links", label: "Links" },
    { id: "embed", label: "Embed" },
    { id: "seo", label: "SEO" },
  ];

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {initialData?.id ? "Edit Project" : "New Project"}
          </h1>
          {saveMsg && (
            <p className={`text-sm mt-1 ${saveMsg.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
              {saveMsg}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {initialData?.id && (
            <>
              <button onClick={saveVersion} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Save Version
              </button>
              {form.status === "published" && (
                <a href={`/projects/${form.slug}`} target="_blank" className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  View Live ↗
                </a>
              )}
            </>
          )}
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="px-4 py-2 text-sm border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 disabled:opacity-50"
          >
            Save Draft
          </button>
          {form.status !== "published" && (
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Publish"}
            </button>
          )}
          {form.status === "published" && (
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2">
          {/* Title */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <div className="mb-4">
              <label className={labelCls}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={inputCls + " text-lg font-medium"}
                placeholder="Project title"
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                className={inputCls + " font-mono text-xs"}
                placeholder="project-slug"
              />
            </div>
            <div>
              <label className={labelCls}>Short Description</label>
              <input
                type="text"
                value={form.shortDesc}
                onChange={(e) => set("shortDesc", e.target.value)}
                className={inputCls}
                placeholder="One-line description shown in cards"
                maxLength={200}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === "content" && (
                <div>
                  <label className={labelCls}>Full Description (Markdown)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={18}
                    className={inputCls + " font-mono text-sm resize-y"}
                    placeholder="## Overview&#10;&#10;Describe your project in detail using Markdown..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Supports Markdown: ## headings, **bold**, `code`, - lists, [links](url)</p>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Manage screenshots and cover image.</p>
                    <button
                      onClick={addScreenshot}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      + Add Screenshot
                    </button>
                  </div>
                  {form.screenshots.length === 0 && (
                    <p className="text-sm text-gray-400 py-4 text-center">No screenshots yet.</p>
                  )}
                  {form.screenshots.map((s, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Screenshot {i + 1} {i === 0 ? "(Cover)" : ""}</span>
                        <button onClick={() => removeScreenshot(i)} className="text-xs text-red-500 hover:underline">Remove</button>
                      </div>
                      {s.url && (
                        <img src={s.url} alt={s.alt} className="w-full max-h-40 object-cover rounded border" />
                      )}
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">URL</label>
                        <input
                          type="url"
                          value={s.url}
                          onChange={(e) => updateScreenshot(i, "url", e.target.value)}
                          className={inputCls}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">Alt text</label>
                          <input type="text" value={s.alt} onChange={(e) => updateScreenshot(i, "alt", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">Caption</label>
                          <input type="text" value={s.caption} onChange={(e) => updateScreenshot(i, "caption", e.target.value)} className={inputCls} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "links" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">External links for this project.</p>
                    <button onClick={addLink} className="text-sm text-indigo-600 hover:underline">+ Add Link</button>
                  </div>
                  {form.links.length === 0 && (
                    <p className="text-sm text-gray-400 py-4 text-center">No links yet.</p>
                  )}
                  {form.links.map((l, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Label</label>
                        <input type="text" value={l.label} onChange={(e) => updateLink(i, "label", e.target.value)} className={inputCls} placeholder="GitHub" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">URL</label>
                        <input type="url" value={l.url} onChange={(e) => updateLink(i, "url", e.target.value)} className={inputCls} placeholder="https://..." />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Icon</label>
                        <div className="flex gap-2">
                          <select value={l.icon} onChange={(e) => updateLink(i, "icon", e.target.value)} className={inputCls}>
                            <option value="">—</option>
                            <option value="github">GitHub</option>
                            <option value="globe">Globe</option>
                            <option value="docs">Docs</option>
                          </select>
                          <button onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600 shrink-0">✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "embed" && (
                <div>
                  <label className={labelCls}>Embed Code</label>
                  <textarea
                    value={form.embedCode}
                    onChange={(e) => set("embedCode", e.target.value)}
                    rows={10}
                    className={inputCls + " font-mono text-xs resize-y"}
                    placeholder="Paste an <iframe>, CodeSandbox, or other embed code..."
                  />
                  <p className="text-xs text-gray-400 mt-1">HTML embed code displayed as a live demo on the project page.</p>
                  {form.embedCode && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">Preview:</p>
                      <div
                        className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 min-h-32"
                        dangerouslySetInnerHTML={{ __html: form.embedCode }}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>SEO Title</label>
                    <input type="text" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={inputCls} placeholder="Leave blank to use project title" />
                  </div>
                  <div>
                    <label className={labelCls}>SEO Description</label>
                    <textarea value={form.seoDesc} onChange={(e) => set("seoDesc", e.target.value)} rows={3} className={inputCls} placeholder="Leave blank to use short description" />
                  </div>
                  <div>
                    <label className={labelCls}>OG Image URL</label>
                    <input type="url" value={form.ogImage} onChange={(e) => set("ogImage", e.target.value)} className={inputCls} placeholder="https://..." />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Publish Status</label>
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              {form.status === "scheduled" && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Schedule Date</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} className={inputCls} />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Dev Status</label>
                <select value={form.devStatus} onChange={(e) => set("devStatus", e.target.value)} className={inputCls}>
                  {DEV_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", +e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
            <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTag(t.id)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      form.tagIds.includes(t.id)
                        ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:border-indigo-200"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tech stack */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tech Stack</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                className={inputCls}
                placeholder="React, Go, etc."
              />
              <button onClick={addTech} className="px-2 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.techStack.map((t) => (
                <span key={t} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                  {t}
                  <button onClick={() => removeTech(t)} className="text-gray-400 hover:text-red-500 ml-0.5">✕</button>
                </span>
              ))}
            </div>
          </div>

          {/* URLs */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">URLs</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Repository URL</label>
                <input type="url" value={form.repoUrl} onChange={(e) => set("repoUrl", e.target.value)} className={inputCls} placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Live URL</label>
                <input type="url" value={form.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} className={inputCls} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Danger */}
          {initialData?.id && (
            <div className="bg-white rounded-xl border border-red-200 p-4">
              <h3 className="text-sm font-semibold text-red-700 mb-3">Danger Zone</h3>
              <button
                onClick={deleteProject}
                className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
