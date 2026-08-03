import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [projectCount, draftCount, pageCount, mediaCount] = await Promise.all([
    prisma.project.count({ where: { status: "published" } }),
    prisma.project.count({ where: { status: "draft" } }),
    prisma.page.count({ where: { status: "published" } }),
    prisma.media.count(),
  ]);

  const recentProjects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { category: true },
  });

  const stats = [
    { label: "Published Projects", value: projectCount, href: "/admin/projects", color: "text-green-600", bg: "bg-green-50" },
    { label: "Draft Projects", value: draftCount, href: "/admin/projects?status=draft", color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Published Pages", value: pageCount, href: "/admin/pages", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Media Files", value: mediaCount, href: "/admin/media", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back to the admin panel.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className={`${s.bg} rounded-xl p-4 hover:opacity-80 transition-opacity`}>
            <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent projects */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Projects</h2>
          <Link href="/admin/projects" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        {recentProjects.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No projects yet. <Link href="/admin/projects/new" className="text-indigo-600 hover:underline">Create your first one.</Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentProjects.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    {p.category && <p className="text-xs text-gray-400">{p.category.name}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.status === "published" ? "bg-green-100 text-green-700" :
                    p.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {p.status}
                  </span>
                  <Link href={`/admin/projects/${p.id}`} className="text-xs text-indigo-600 hover:underline">Edit</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {[
          { label: "New Project", href: "/admin/projects/new" },
          { label: "New Page", href: "/admin/pages/new" },
          { label: "Upload Media", href: "/admin/media" },
          { label: "Site Settings", href: "/admin/settings" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-200 transition-colors text-center"
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
