import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};
  if (status && status !== "all") where.status = status;
  if (q) where.OR = [{ title: { contains: q } }, { excerpt: { contains: q } }];

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    title, slug, excerpt, content, status, featured, authorName,
    heroImage, heroImageAlt, categoryId, tags,
    seoTitle, seoDesc, ogImage, scheduledAt,
  } = body;

  const finalSlug = slug || slugify(title);

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug: finalSlug,
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
      publishedAt: status === "published" ? new Date() : scheduledAt ? new Date(scheduledAt) : null,
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

  return NextResponse.json(post, { status: 201 });
}
