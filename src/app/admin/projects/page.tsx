import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, devStatusLabel, devStatusColor } from "@/lib/utils";

interface Props {
  searchParams: { status?: string; category?: string; q?: string };
}

export default async function AdminProjectsPage({ searchParams }: Props) {
  const { status, category, q } = searchParams;

  const projects = await prisma.project.findMany({
    where: {
      ...(status && status !== "all" ? { status } : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { shortDesc: { contains: q } }] } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { category: true, tags: { include: { tag: true } }, _count: { select: { screenshots: true } } },
  });

  const counts = await prisma.project.groupBy({
    by: ["status"],
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const total = counts.reduce((a, c) => a + c._count, 0);

  const tabs = [
    { label: "All", value: undefined, count: total },
    { label: "Published", value: "published", count: countMap.published ?? 0 },
    { label: "Draft", value: "draft", count: countMap.draft ?? 0 },
    { label: "Scheduled", value: "scheduled", count: countMap.scheduled ?? 0 },
    { label: "Archived", value: "archived", count: countMap.archived ?? 0 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + New Project
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/admin/projects?status=${tab.value}` : "/admin/projects"}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              (tab.value ?? "") === (status ?? "")
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form method="GET" className="mb-4">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search projects…"
          className="w-full sm:w-80 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="mb-2">No projects found.</p>
            <Link href="/admin/projects/new" className="text-indigo-600 hover:underline text-sm">Create one →</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Dev Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.featured && <span className="text-yellow-500" title="Featured">★</span>}
                      <span className="font-medium text-gray-900">{p.title}</span>
                    </div>
                    {p.shortDesc && <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{p.shortDesc}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${devStatusColor(p.devStatus)}`}>
                      {devStatusLabel(p.devStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === "published" ? "bg-green-100 text-green-700" :
                      p.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                      p.status === "archived" ? "bg-gray-100 text-gray-500" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      {p.status === "published" && (
                        <Link href={`/projects/${p.slug}`} target="_blank" className="text-xs text-gray-400 hover:text-gray-600">View</Link>
                      )}
                      <Link href={`/admin/projects/${p.id}`} className="text-xs text-indigo-600 hover:underline">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
