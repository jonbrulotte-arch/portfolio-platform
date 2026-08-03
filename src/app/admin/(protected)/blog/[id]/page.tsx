import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogPostEditor from "@/components/admin/BlogPostEditor";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id: params.id },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.blogCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <BlogPostEditor
      initialData={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        status: post.status,
        featured: post.featured,
        authorName: post.authorName ?? "",
        heroImage: post.heroImage ?? "",
        heroImageAlt: post.heroImageAlt ?? "",
        categoryId: post.categoryId ?? "",
        tags: post.tags.map((t) => t.tag.name).join(", "),
        seoTitle: post.seoTitle ?? "",
        seoDesc: post.seoDesc ?? "",
        ogImage: post.ogImage ?? "",
        scheduledAt: post.scheduledAt?.toISOString().slice(0, 16) ?? "",
      }}
      categories={categories}
    />
  );
}
