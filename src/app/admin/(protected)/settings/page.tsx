"use client";
import { useState, useEffect, useRef } from "react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

const SECTIONS = [
  {
    title: "Site Identity",
    fields: [
      { key: "siteName", label: "Site Name", type: "text" },
      { key: "siteTagline", label: "Tagline", type: "text" },
      { key: "siteDescription", label: "Description", type: "textarea" },
      { key: "siteLogo", label: "Site Logo", type: "logo" },
    ],
  },
  {
    title: "Owner / Author",
    fields: [
      { key: "ownerName", label: "Your Name", type: "text" },
      { key: "ownerEmail", label: "Email", type: "email" },
      { key: "ownerBio", label: "Bio", type: "textarea" },
      { key: "ownerAvatar", label: "Avatar URL", type: "url" },
    ],
  },
  {
    title: "Social Links",
    fields: [
      { key: "githubUrl", label: "GitHub URL", type: "url" },
      { key: "linkedinUrl", label: "LinkedIn URL", type: "url" },
      { key: "twitterUrl", label: "Twitter URL", type: "url" },
    ],
  },
  {
    title: "Appearance",
    fields: [
      { key: "accentColor", label: "Accent Color", type: "color" },
      { key: "footerText", label: "Footer Text", type: "text" },
    ],
  },
  {
    title: "SEO & Analytics",
    fields: [
      { key: "ogDefaultImage", label: "Default OG Image URL", type: "url" },
      { key: "analyticsId", label: "Analytics ID (GA4)", type: "text" },
    ],
  },
  {
    title: "Homepage Sections",
    fields: [
      { key: "homeShowHero",       label: "Show Hero Section",      type: "toggle" },
      { key: "homeShowCategories", label: "Show Categories Bar",    type: "toggle" },
      { key: "homeShowFeatured",   label: "Show Featured Projects", type: "toggle" },
      { key: "homeShowRecent",     label: "Show Recent Projects",   type: "toggle" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoPicker, setLogoPicker] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" }).then((r) => r.json()).then(setSettings);
  }, []);

  async function uploadLogo(file: File) {
    setLogoUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/media", { method: "POST", body: fd });
    if (res.ok) {
      const m = await res.json();
      setSettings((s) => ({ ...s, siteLogo: m.url, siteLogoAlt: s.siteLogoAlt || file.name }));
    }
    setLogoUploading(false);
    if (logoUploadRef.current) logoUploadRef.current.value = "";
  }

  async function save() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title} className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  {field.type === "logo" ? (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                      {settings.siteLogo && (
                        <div className="flex items-center gap-3">
                          <img src={settings.siteLogo} alt={settings.siteLogoAlt || "Site logo"} className="h-12 max-w-[200px] object-contain rounded border border-gray-200 bg-gray-50 p-1" />
                          <button
                            type="button"
                            onClick={() => setSettings((s) => ({ ...s, siteLogo: "", siteLogoAlt: "" }))}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <label className={`cursor-pointer text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${logoUploading ? "opacity-60 pointer-events-none" : ""}`}>
                          {logoUploading ? "Uploading…" : "Upload Logo"}
                          <input
                            ref={logoUploadRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setLogoPicker(true)}
                          className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Browse Library
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Logo Alt Text (for accessibility)</label>
                        <input
                          type="text"
                          value={settings.siteLogoAlt ?? ""}
                          onChange={(e) => setSettings((s) => ({ ...s, siteLogoAlt: e.target.value }))}
                          placeholder="e.g. Acme Corp logo"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  ) : field.type === "toggle" ? (
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">{field.label}</span>
                      <button
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, [field.key]: s[field.key] === "false" ? "true" : "false" }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[field.key] !== "false" ? "bg-indigo-600" : "bg-gray-200"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          settings[field.key] !== "false" ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </label>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={settings[field.key] ?? ""}
                          onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                          rows={3}
                          className={inputCls}
                        />
                      ) : field.type === "color" ? (
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings[field.key] ?? "#6366f1"}
                            onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                            className="w-10 h-9 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings[field.key] ?? ""}
                            onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                            className={inputCls}
                          />
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          value={settings[field.key] ?? ""}
                          onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                          className={inputCls}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <MediaPickerModal
        open={logoPicker}
        onClose={() => setLogoPicker(false)}
        onSelect={(url, filename, alt) => {
          setSettings((s) => ({ ...s, siteLogo: url, siteLogoAlt: s.siteLogoAlt || alt || filename }));
          setLogoPicker(false);
        }}
      />
    </div>
  );
}
