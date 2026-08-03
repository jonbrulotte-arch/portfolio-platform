import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import ProjectCard from "@/components/public/ProjectCard";
import Link from "next/link";

export default async function HomePage() {
  const [settings, featured, recentProjects, categories] = await Promise.all([
    getSettings(),
    prisma.project.findMany({
      where: { status: "published", featured: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
      include: {
        category: true,
        tags: { include: { tag: true } },
        screenshots: { orderBy: { sortOrder: "asc" }, take: 1 },
        links: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.project.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      take: 6,
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
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {settings.ownerName || settings.siteName}
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-4">{settings.siteTagline}</p>
          {settings.ownerBio && (
            <p className="text-gray-500 max-w-2xl mx-auto mb-8">{settings.ownerBio}</p>
          )}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Browse Projects
            </Link>
            {settings.githubUrl && (
              <a
                href={settings.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 px-4 sm:px-6 border-b border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/projects?category=${cat.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm font-medium text-gray-700"
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                  <span className="text-gray-400 text-xs">({cat._count.projects})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Projects</h2>
              <Link href="/projects" className="text-sm text-indigo-600 hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p) => (
                <ProjectCard key={p.id} project={p as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent */}
      {recentProjects.length > 0 && (
        <section className="py-16 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
              <Link href="/projects" className="text-sm text-indigo-600 hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((p) => (
                <ProjectCard key={p.id} project={p as any} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
