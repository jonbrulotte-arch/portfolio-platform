import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const settings = await getSettings();
  const siteUrl = new URL(req.url).origin;

  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: { tags: { include: { tag: true } } },
  });

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: settings.siteName || "Blog",
    description: settings.siteDescription || undefined,
    home_page_url: `${siteUrl}/blog`,
    feed_url: `${siteUrl}/blog/feed.json`,
    favicon: settings.siteLogo || undefined,
    items: posts.map((p) => ({
      id: `${siteUrl}/blog/${p.slug}`,
      url: `${siteUrl}/blog/${p.slug}`,
      title: p.title,
      summary: p.excerpt || undefined,
      content_html: p.content || undefined,
      date_published: (p.publishedAt ?? p.createdAt).toISOString(),
      date_modified: p.updatedAt.toISOString(),
      authors: p.authorName ? [{ name: p.authorName }] : undefined,
      tags: p.tags.map((t) => t.tag.name),
      image: p.heroImage ? `${siteUrl}${p.heroImage}` : undefined,
    })),
  };

  return NextResponse.json(feed, {
    headers: {
      "Content-Type": "application/feed+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
