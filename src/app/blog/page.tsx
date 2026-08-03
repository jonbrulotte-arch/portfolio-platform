import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog" };

const PAGE_SIZE = 10;

interface Props {
  searchParams: { page?: string; category?: string; tag?: string; q?: string };
}

export default async function BlogPage({ searchParams }: Props) {
  const settings = await getSettings();
  const accent = settings.accentColor || "#6366f1";
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const { category, tag, q } = searchParams;

  const where: any = {
    status: "published",
    ...(category ? { category: { slug: category } } : {}),
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] } : {}),
  };

  const [posts, total, categories, tags] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true, tags: { include: { tag: true } } },
    }),
    prisma.blogPost.count({ where }),
    prisma.blogCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { posts: { where: { status: "published" } } } } },
    }),
    prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: { where: { post: { status: "published" } } } } } },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilter = !!(category || tag || q);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
          <p className="text-gray-500">Thoughts, tutorials, and updates.</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <a href="/blog/feed.xml" className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-medium" target="_blank" rel="noopener noreferrer">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
            RSS
          </a>
          <a href="/blog/atom.xml" className="text-gray-400 hover:text-gray-600" target="_blank" rel="noopener noreferrer">Atom</a>
          <a href="/blog/feed.json" className="text-gray-400 hover:text-gray-600" target="_blank" rel="noopener noreferrer">JSON Feed</a>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0 space-y-6">
          <form method="GET">
            {category && <input type="hidden" name="category" value={category} />}
            {tag && <input type="hidden" name="tag" value={tag} />}
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search posts…"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {categories.filter((c) => c._count.posts > 0).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/blog" className={`block text-sm px-2 py-1 rounded ${!category ? "text-indigo-600 font-medium bg-indigo-50" : "text-gray-600 hover:text-gray-900"}`}>
                    All ({total})
                  </Link>
                </li>
                {categories.filter((c) => c._count.posts > 0).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/blog?category=${cat.slug}`}
                      className={`flex items-center gap-1.5 text-sm px-2 py-1 rounded ${category === cat.slug ? "text-indigo-600 font-medium bg-indigo-50" : "text-gray-600 hover:text-gray-900"}`}
                    >
                      {cat.name}
                      <span className="ml-auto text-xs text-gray-400">{cat._count.posts}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tags.filter((t) => t._count.posts > 0).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {tags.filter((t) => t._count.posts > 0).map((t) => (
                  <Link
                    key={t.id}
                    href={`/blog?tag=${t.slug}`}
                    className={`text-xs px-2 py-0.5 rounded-full border ${tag === t.slug ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600"}`}
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {hasFilter && (
            <Link href="/blog" className="text-xs text-red-500 hover:underline">Clear filters</Link>
          )}
        </aside>

        {/* Posts */}
        <div className="flex-1">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No posts found.</p>
              {hasFilter && <Link href="/blog" className="text-sm text-indigo-500 hover:underline mt-2 inline-block">Clear filters</Link>}
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    {post.heroImage && (
                      <div className="aspect-[16/7] overflow-hidden rounded-xl mb-4 bg-gray-100">
                        <img
                          src={post.heroImage}
                          alt={post.heroImageAlt ?? post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {post.featured && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}18`, color: accent }}>Featured</span>
                      )}
                      {post.category && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: post.category.color ? `${post.category.color}18` : `${accent}15`, color: post.category.color ?? accent }}
                        >
                          {post.category.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Draft"}
                      </span>
                      {post.authorName && <span className="text-xs text-gray-400">· {post.authorName}</span>}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">{post.title}</h2>
                    {post.excerpt && <p className="text-gray-500 leading-relaxed line-clamp-3">{post.excerpt}</p>}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.map((t) => (
                        <span key={t.tagId} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t.tag.name}</span>
                      ))}
                    </div>
                    <div className="mt-3 text-sm font-medium" style={{ color: accent }}>Read more →</div>
                  </Link>
                  <div className="mt-6 border-t border-gray-100" />
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <Link
                  href={`/blog?page=${page - 1}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}${q ? `&q=${q}` : ""}`}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              {page < totalPages && (
                <Link
                  href={`/blog?page=${page + 1}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}${q ? `&q=${q}` : ""}`}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
