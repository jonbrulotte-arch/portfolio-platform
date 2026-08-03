import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const settings = await getSettings();
  const siteUrl = new URL(req.url).origin;
  const siteTitle = settings.siteName || "Blog";
  const siteDesc = settings.siteDescription || "";
  const buildDate = new Date().toUTCString();

  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: { category: true, tags: { include: { tag: true } } },
  });

  const items = posts.map((p) => {
    const url = `${siteUrl}/blog/${p.slug}`;
    const pubDate = (p.publishedAt ?? p.createdAt).toUTCString();
    const cats = p.tags.map((t) => `<category>${esc(t.tag.name)}</category>`).join("\n    ");
    return `
  <item>
    <title>${esc(p.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${pubDate}</pubDate>
    ${p.excerpt ? `<description>${esc(p.excerpt)}</description>` : ""}
    ${p.content ? `<content:encoded><![CDATA[${p.content}]]></content:encoded>` : ""}
    ${p.authorName ? `<dc:creator>${esc(p.authorName)}</dc:creator>` : ""}
    ${cats}
  </item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(siteTitle)}</title>
    <link>${siteUrl}/blog</link>
    <description>${esc(siteDesc)}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
