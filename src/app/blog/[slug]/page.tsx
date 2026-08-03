import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug, status: "published" } });
  if (!post) return {};
  const s = await getSettings();
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDesc ?? post.excerpt ?? s.siteDescription,
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDesc ?? post.excerpt ?? undefined,
      images: post.ogImage ? [{ url: post.ogImage }] : post.heroImage ? [{ url: post.heroImage }] : undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const settings = await getSettings();
  const accent = settings.accentColor || "#6366f1";

  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, status: "published" },
    include: { category: true, tags: { include: { tag: true } } },
  });

  if (!post) notFound();

  const related = await prisma.blogPost.findMany({
    where: {
      status: "published",
      id: { not: post.id },
      OR: [
        ...(post.categoryId ? [{ categoryId: post.categoryId }] : []),
        ...(post.tags.length ? [{ tags: { some: { tagId: { in: post.tags.map((t) => t.tagId) } } } }] : []),
      ],
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return (
    <article>
      {/* Hero */}
      {post.heroImage ? (
        <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden bg-gray-900">
          <img src={post.heroImage} alt={post.heroImageAlt ?? post.title} className="w-full h-full object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-4 sm:px-6 pb-8">
            <PostMeta post={post} accent={accent} dark />
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mt-2">{post.title}</h1>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12">
          <PostMeta post={post} accent={accent} />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mt-3">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-gray-500 leading-relaxed">{post.excerpt}</p>}
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {post.heroImage && post.excerpt && (
          <p className="text-lg text-gray-500 leading-relaxed mb-8 pb-8 border-b border-gray-100">{post.excerpt}</p>
        )}

        {post.content && (
          <div
            className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Link
                key={t.tagId}
                href={`/blog?tag=${t.tag.slug}`}
                className="text-sm px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
              >
                #{t.tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Feed links */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-400">
          <span>Subscribe:</span>
          <a href="/blog/feed.xml" className="flex items-center gap-1 text-orange-500 hover:text-orange-600" target="_blank" rel="noopener noreferrer">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
            RSS
          </a>
          <a href="/blog/atom.xml" className="hover:text-gray-600" target="_blank" rel="noopener noreferrer">Atom</a>
          <a href="/blog/feed.json" className="hover:text-gray-600" target="_blank" rel="noopener noreferrer">JSON Feed</a>
        </div>

        {/* Back link */}
        <div className="mt-6">
          <Link href="/blog" className="text-sm font-medium" style={{ color: accent }}>← Back to Blog</Link>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-400 mb-1">{r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : ""}</p>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-2 transition-colors">{r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

function PostMeta({ post, accent, dark = false }: { post: any; accent: string; dark?: boolean }) {
  const textCls = dark ? "text-white/70" : "text-gray-400";
  return (
    <div className={`flex items-center gap-2 flex-wrap text-sm ${textCls}`}>
      <Link href="/blog" className={`hover:underline ${dark ? "text-white/80" : "text-gray-500"}`}>Blog</Link>
      <span>/</span>
      {post.category && (
        <>
          <span style={{ color: dark ? undefined : (post.category.color ?? accent) }}>{post.category.name}</span>
          <span>/</span>
        </>
      )}
      {post.publishedAt && (
        <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
      )}
      {post.authorName && <><span>·</span><span>{post.authorName}</span></>}
    </div>
  );
}
