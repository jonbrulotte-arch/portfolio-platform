import { prisma } from "@/lib/prisma";
import ProjectEditor from "@/components/admin/ProjectEditor";

export default async function NewProjectPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <ProjectEditor categories={categories} tags={tags} />;
}
