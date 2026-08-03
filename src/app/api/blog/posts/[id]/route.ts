import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
    include: { category: true, tags: { include: { tag: true } } },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    title, slug, excerpt, content, status, featured, authorName,
    heroImage, heroImageAlt, categoryId, tags,
    seoTitle, seoDesc, ogImage, scheduledAt,
  } = body;

  const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const wasPublished = existing.status === "published";
  const isPublishing = status === "published" && !wasPublished;

  await prisma.blogPostTag.deleteMany({ where: { postId: params.id } });

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      title,
      slug: slug || slugify(title),
      excerpt: excerpt || null,
      content: content || null,
      status: status || "draft",
      featured: !!featured,
      authorName: authorName || null,
      heroImage: heroImage || null,
      heroImageAlt: heroImageAlt || null,
      categoryId: categoryId || null,
      seoTitle: seoTitle || null,
      seoDesc: seoDesc || null,
      ogImage: ogImage || null,
      publishedAt: isPublishing ? new Date() : existing.publishedAt,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      tags: tags?.length
        ? {
            create: await Promise.all(
              (tags as string[]).map(async (name: string) => {
                const tagSlug = slugify(name);
                const tag = await prisma.blogTag.upsert({
                  where: { slug: tagSlug },
                  update: {},
                  create: { name, slug: tagSlug },
                });
                return { tagId: tag.id };
              })
            ),
          }
        : undefined,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
