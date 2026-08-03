import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: { category: true, tags: { include: { tag: true } } },
  });

  const statusBadge = (s: string) => {
    if (s === "published") return "bg-green-100 text-green-700";
    if (s === "draft") return "bg-gray-100 text-gray-600";
    if (s === "scheduled") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-600";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-sm text-gray-500 mt-0.5">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-xs text-gray-400">
            <a href="/blog/feed.xml" target="_blank" className="hover:text-orange-500">RSS</a>
            <span>·</span>
            <a href="/blog/atom.xml" target="_blank" className="hover:text-gray-600">Atom</a>
            <span>·</span>
            <a href="/blog/feed.json" target="_blank" className="hover:text-gray-600">JSON</a>
          </div>
          <Link href="/admin/blog/new" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            + New Post
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">✍️</p>
          <p className="font-medium text-gray-600">No posts yet</p>
          <p className="text-sm mt-1">Write your first blog post to get started.</p>
          <Link href="/admin/blog/new" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Create Post</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              {post.heroImage ? (
                <img src={post.heroImage} alt="" className="w-14 h-10 object-cover rounded-lg border border-gray-200 shrink-0" />
              ) : (
                <div className="w-14 h-10 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-xl">📝</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/admin/blog/${post.id}`} className="font-medium text-gray-900 hover:text-indigo-600 truncate">{post.title}</Link>
                  {post.featured && <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded font-medium">Featured</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-gray-400">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${statusBadge(post.status)}`}>{post.status}</span>
                  {post.category && <span>{post.category.name}</span>}
                  {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
                  {post.tags.length > 0 && (
                    <span className="truncate max-w-[200px]">{post.tags.map((t) => t.tag.name).join(", ")}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {post.status === "published" && (
                  <a href={`/blog/${post.slug}`} target="_blank" className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 border border-gray-200 rounded">View ↗</a>
                )}
                <Link href={`/admin/blog/${post.id}`} className="text-xs text-indigo-600 hover:underline px-2 py-1">Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
