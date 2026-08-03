import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const settings = await getSettings();
  const siteUrl = new URL(req.url).origin;
  const siteTitle = settings.siteName || "Blog";
  const siteDesc = settings.siteDescription || "";
  const updated = new Date().toISOString();

  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: { tags: { include: { tag: true } } },
  });

  const entries = posts.map((p) => {
    const url = `${siteUrl}/blog/${p.slug}`;
    const pubDate = (p.publishedAt ?? p.createdAt).toISOString();
    const cats = p.tags.map((t) => `<category term="${esc(t.tag.name)}"/>`).join("\n    ");
    return `
  <entry>
    <id>${url}</id>
    <title>${esc(p.title)}</title>
    <link href="${url}"/>
    <published>${pubDate}</published>
    <updated>${p.updatedAt.toISOString()}</updated>
    ${p.authorName ? `<author><name>${esc(p.authorName)}</name></author>` : ""}
    ${p.excerpt ? `<summary type="text">${esc(p.excerpt)}</summary>` : ""}
    ${p.content ? `<content type="html"><![CDATA[${p.content}]]></content>` : ""}
    ${cats}
  </entry>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(siteTitle)}</title>
  <subtitle>${esc(siteDesc)}</subtitle>
  <link href="${siteUrl}/blog"/>
  <link rel="self" href="${siteUrl}/blog/atom.xml"/>
  <id>${siteUrl}/blog</id>
  <updated>${updated}</updated>
  ${entries}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
