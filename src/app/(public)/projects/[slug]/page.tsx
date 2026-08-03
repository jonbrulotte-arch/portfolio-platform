import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { devStatusColor, devStatusLabel, formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await prisma.project.findUnique({ where: { slug: params.slug } });
  if (!project) return {};
  const s = await getSettings();
  return {
    title: project.seoTitle ?? project.title,
    description: project.seoDesc ?? project.shortDesc ?? s.siteDescription,
    openGraph: { images: project.ogImage ? [project.ogImage] : [] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug, status: "published" },
    include: {
      category: true,
      tags: { include: { tag: true } },
      screenshots: { orderBy: { sortOrder: "asc" } },
      links: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!project) notFound();

  const techStack: string[] = project.techStack ? JSON.parse(project.techStack) : [];

  const linkIcon = (icon: string | null) => {
    if (icon === "github") return "⬡";
    if (icon === "globe") return "🌐";
    if (icon === "docs") return "📄";
    return "🔗";
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/projects" className="hover:text-gray-600">Projects</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{project.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start gap-3 mb-4">
          <h1 className="text-4xl font-bold text-gray-900 flex-1">{project.title}</h1>
          <span className={`text-sm px-3 py-1 rounded-full font-medium shrink-0 mt-1 ${devStatusColor(project.devStatus)}`}>
            {devStatusLabel(project.devStatus)}
          </span>
        </div>

        {project.shortDesc && (
          <p className="text-xl text-gray-600 mb-4">{project.shortDesc}</p>
        )}

        <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500">
          {project.category && (
            <Link
              href={`/projects?category=${project.category.slug}`}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: project.category.color ? `${project.category.color}20` : "#e0e7ff",
                color: project.category.color ?? "#4f46e5",
              }}
            >
              {project.category.icon} {project.category.name}
            </Link>
          )}
          {project.tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/projects?tag=${tag.slug}`}
              className="px-2 py-0.5 rounded-full border border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600"
            >
              {tag.name}
            </Link>
          ))}
          {project.publishedAt && (
            <span className="text-gray-400">Published {formatDate(project.publishedAt)}</span>
          )}
        </div>
      </header>

      {/* Cover image */}
      {project.screenshots[0] && (
        <div className="mb-8 rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
          <img
            src={project.screenshots[0].url}
            alt={project.screenshots[0].alt ?? project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {project.description && (
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(project.description) }}
            />
          )}

          {/* Embed */}
          {project.embedCode && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Demo</h2>
              <div
                className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                dangerouslySetInnerHTML={{ __html: project.embedCode }}
              />
            </div>
          )}

          {/* Screenshots gallery */}
          {project.screenshots.length > 1 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Screenshots</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.screenshots.slice(1).map((s) => (
                  <div key={s.id} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={s.url} alt={s.alt ?? ""} className="w-full object-cover" />
                    {s.caption && <p className="text-xs text-gray-500 p-2">{s.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Links */}
          {project.links.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Links</h3>
              <ul className="space-y-2">
                {project.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                    >
                      <span>{linkIcon(link.icon)}</span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech stack */}
          {techStack.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-1.5">
                {techStack.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-700 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick info */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Details</h3>
            {project.repoUrl && (
              <div className="text-sm">
                <span className="text-gray-400">Repository: </span>
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate block">
                  {project.repoUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </div>
            )}
            {project.liveUrl && (
              <div className="text-sm">
                <span className="text-gray-400">Live URL: </span>
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate block">
                  {project.liveUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </div>
            )}
            <div className="text-sm">
              <span className="text-gray-400">Status: </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${devStatusColor(project.devStatus)}`}>
                {devStatusLabel(project.devStatus)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

function markdownToHtml(text: string): string {
  return text
    .replace(/^#{3} (.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2} (.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{1} (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|u|o|l|p|b|i])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}
