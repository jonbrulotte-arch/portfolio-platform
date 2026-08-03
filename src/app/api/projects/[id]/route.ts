export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function auth() {
  const session = await getServerSession(authOptions);
  return session ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      tags: { include: { tag: true } },
      links: { orderBy: { sortOrder: "asc" } },
      screenshots: { orderBy: { sortOrder: "asc" } },
      versions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const err = await auth();
  if (err) return err;

  const body = await req.json();
  const {
    title, slug, shortDesc, description, status, devStatus, featured, sortOrder,
    categoryId, techStack, repoUrl, liveUrl, embedCode, seoTitle, seoDesc, ogImage,
    scheduledAt, tagIds, links, screenshots,
  } = body;

  const existing = await prisma.project.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.projectTag.deleteMany({ where: { projectId: params.id } }),
    prisma.projectLink.deleteMany({ where: { projectId: params.id } }),
    prisma.screenshot.deleteMany({ where: { projectId: params.id } }),
  ]);

  const publishedAt =
    status === "published" && existing.status !== "published"
      ? new Date()
      : existing.publishedAt;

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      title,
      slug,
      shortDesc: shortDesc || null,
      description: description || null,
      status,
      devStatus,
      featured: !!featured,
      sortOrder: sortOrder ?? 0,
      categoryId: categoryId || null,
      techStack: techStack?.length ? JSON.stringify(techStack) : null,
      repoUrl: repoUrl || null,
      liveUrl: liveUrl || null,
      embedCode: embedCode || null,
      seoTitle: seoTitle || null,
      seoDesc: seoDesc || null,
      ogImage: ogImage || null,
      publishedAt,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      archivedAt: status === "archived" ? new Date() : null,
      tags: {
        create: (tagIds ?? []).map((id: string) => ({ tagId: id })),
      },
      links: {
        create: (links ?? []).map((l: any, i: number) => ({
          label: l.label, url: l.url, icon: l.icon || null, sortOrder: i,
        })),
      },
      screenshots: {
        create: (screenshots ?? []).map((s: any, i: number) => ({
          url: s.url, alt: s.alt || null, caption: s.caption || null, sortOrder: i,
        })),
      },
    },
  });

  revalidatePath("/projects", "layout");
  revalidatePath(`/projects/${project.slug}`);
  return NextResponse.json(project);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const err = await auth();
  if (err) return err;

  const project = await prisma.project.findUnique({ where: { id: params.id }, select: { slug: true } });
  await prisma.project.delete({ where: { id: params.id } });
  if (project) revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/projects", "layout");
  return NextResponse.json({ ok: true });
}
