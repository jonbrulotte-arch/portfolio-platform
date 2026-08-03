import { prisma } from "@/lib/prisma";
import BlogPostEditor from "@/components/admin/BlogPostEditor";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const categories = await prisma.blogCategory.findMany({ orderBy: { sortOrder: "asc" } });
  return <BlogPostEditor categories={categories} />;
}
