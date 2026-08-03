import Link from "next/link";

const DOCS = [
  {
    slug: "installation",
    title: "Installation & Configuration",
    description: "Setup, environment variables, Nginx, systemd, updating.",
  },
  {
    slug: "admin-guide",
    title: "Admin Guide",
    description: "Using the dashboard: projects, pages, media, settings, and more.",
  },
  {
    slug: "backup-restore",
    title: "Backup & Restore",
    description: "Creating backups, cron automation, encryption, and server migration.",
  },
  {
    slug: "development",
    title: "Development Guide",
    description: "Project structure, key patterns, schema, and adding features.",
  },
];

export default function AdminDocsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
        <p className="text-sm text-gray-500 mt-1">Guides for setting up, using, and extending Sympl CMS.</p>
      </div>

      <div className="space-y-3">
        {DOCS.map((doc) => (
          <Link
            key={doc.slug}
            href={`/admin/docs/${doc.slug}`}
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {doc.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
              </div>
              <span className="text-gray-300 group-hover:text-indigo-400 text-lg mt-0.5 shrink-0">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
