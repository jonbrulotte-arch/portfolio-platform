import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        <Link href="/admin/pages/new" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          + New Page
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {pages.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No pages yet. <Link href="/admin/pages/new" className="text-indigo-600 hover:underline">Create one →</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Nav</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden md:table-cell">/{p.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === "published" ? "bg-green-100 text-green-700" :
                      p.status === "draft" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                    {p.inNav ? `✓ (${p.navOrder})` : "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      {p.status === "published" && (
                        <Link href={`/${p.slug}`} target="_blank" className="text-xs text-gray-400 hover:text-gray-600">View</Link>
                      )}
                      <Link href={`/admin/pages/${p.id}`} className="text-xs text-indigo-600 hover:underline">Edit</Link>
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
