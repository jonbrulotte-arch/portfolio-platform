import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import ProjectCard from "@/components/public/ProjectCard";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Projects" };

interface Props {
  searchParams: { category?: string; tag?: string; q?: string; status?: string };
}

export default async function ProjectsPage({ searchParams }: Props) {
  const { category, tag, q, status } = searchParams;
  const settings = await getSettings();
  const accent = settings.accentColor || "#6366f1";

  const [projects, categories, tags] = await Promise.all([
    prisma.project.findMany({
      where: {
        status: status === "all" ? undefined : "published",
        ...(category ? { category: { slug: category } } : {}),
        ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
        ...(q ? { OR: [{ title: { contains: q } }, { shortDesc: { contains: q } }] } : {}),
      },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }],
      include: {
        category: true,
        tags: { include: { tag: true } },
        screenshots: { orderBy: { sortOrder: "asc" }, take: 1 },
        links: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { projects: { where: { status: "published" } } } } },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { projects: { where: { project: { status: "published" } } } } } },
    }),
  ]);

  const hasFilter = !!(category || tag || q);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Projects</h1>
        <p className="text-gray-500">All my software projects, tools, and experiments.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-56 shrink-0">
          <div className="space-y-6">
            {/* Search */}
            <form method="GET">
              {category && <input type="hidden" name="category" value={category} />}
              {tag && <input type="hidden" name="tag" value={tag} />}
              <div className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Search projects..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/projects"
                    className={`block text-sm px-2 py-1 rounded ${!category ? "text-indigo-600 font-medium bg-indigo-50" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    All ({projects.length})
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/projects?category=${cat.slug}`}
                      className={`flex items-center gap-1.5 text-sm px-2 py-1 rounded ${category === cat.slug ? "text-indigo-600 font-medium bg-indigo-50" : "text-gray-600 hover:text-gray-900"}`}
                    >
                      {cat.icon && <span>{cat.icon}</span>}
                      {cat.name}
                      <span className="ml-auto text-xs text-gray-400">{cat._count.projects}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.filter(t => t._count.projects > 0).map((t) => (
                    <Link
                      key={t.id}
                      href={`/projects?tag=${t.slug}`}
                      className={`text-xs px-2 py-0.5 rounded-full border ${tag === t.slug ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600"}`}
                    >
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {hasFilter && (
              <Link href="/projects" className="text-xs text-red-500 hover:underline">Clear filters</Link>
            )}
          </div>
        </aside>

        {/* Projects grid */}
        <div className="flex-1">
          {projects.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No projects found.</p>
              {hasFilter && <Link href="/projects" className="text-sm text-indigo-500 hover:underline mt-2 inline-block">Clear filters</Link>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p as any} accent={accent} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
