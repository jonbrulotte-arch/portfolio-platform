import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const projects = await prisma.project.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { category: true, tags: { include: { tag: true } } },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    title, slug, shortDesc, description, status, devStatus, featured, sortOrder,
    categoryId, techStack, repoUrl, liveUrl, embedCode, seoTitle, seoDesc, ogImage,
    scheduledAt, tagIds, links, screenshots,
  } = body;

  const project = await prisma.project.create({
    data: {
      title,
      slug: slug || slugify(title),
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
      publishedAt: status === "published" ? new Date() : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      tags: {
        create: (tagIds ?? []).map((id: string) => ({ tagId: id })),
      },
      links: {
        create: (links ?? []).map((l: any, i: number) => ({
          label: l.label,
          url: l.url,
          icon: l.icon || null,
          sortOrder: i,
        })),
      },
      screenshots: {
        create: (screenshots ?? []).map((s: any, i: number) => ({
          url: s.url,
          alt: s.alt || null,
          caption: s.caption || null,
          sortOrder: i,
        })),
      },
    },
  });

  revalidatePath("/projects", "layout");
  return NextResponse.json(project, { status: 201 });
}
