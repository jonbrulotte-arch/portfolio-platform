import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProjectEditor from "@/components/admin/ProjectEditor";

interface Props { params: { id: string } }

export default async function EditProjectPage({ params }: Props) {
  const [project, categories, tags] = await Promise.all([
    prisma.project.findUnique({
      where: { id: params.id },
      include: {
        tags: true,
        links: { orderBy: { sortOrder: "asc" } },
        screenshots: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!project) notFound();

  return (
    <ProjectEditor
      categories={categories}
      tags={tags}
      initialData={{
        id: project.id,
        title: project.title,
        slug: project.slug,
        shortDesc: project.shortDesc ?? "",
        description: project.description ?? "",
        status: project.status,
        devStatus: project.devStatus,
        featured: project.featured,
        sortOrder: project.sortOrder,
        categoryId: project.categoryId ?? "",
        techStack: project.techStack ? JSON.parse(project.techStack) : [],
        repoUrl: project.repoUrl ?? "",
        liveUrl: project.liveUrl ?? "",
        embedCode: project.embedCode ?? "",
        seoTitle: project.seoTitle ?? "",
        seoDesc: project.seoDesc ?? "",
        ogImage: project.ogImage ?? "",
        scheduledAt: project.scheduledAt ? new Date(project.scheduledAt).toISOString().slice(0, 16) : "",
        tagIds: project.tags.map((t) => t.tagId),
        links: project.links.map((l) => ({ id: l.id, label: l.label, url: l.url, icon: l.icon ?? "", sortOrder: l.sortOrder })),
        screenshots: project.screenshots.map((s) => ({ id: s.id, url: s.url, alt: s.alt ?? "", caption: s.caption ?? "", sortOrder: s.sortOrder })),
      }}
    />
  );
}
