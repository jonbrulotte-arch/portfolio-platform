import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageEditor from "@/components/admin/PageEditor";

export default async function EditPagePage({ params }: { params: { id: string } }) {
  const page = await prisma.page.findUnique({ where: { id: params.id } });
  if (!page) notFound();

  return (
    <PageEditor
      initialData={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content ?? "",
        status: page.status,
        inNav: page.inNav,
        navOrder: page.navOrder,
        seoTitle: page.seoTitle ?? "",
        seoDesc: page.seoDesc ?? "",
        ogImage: page.ogImage ?? "",
        heroImage: page.heroImage ?? "",
        heroImageAlt: page.heroImageAlt ?? "",
        scheduledAt: page.scheduledAt ? new Date(page.scheduledAt).toISOString().slice(0, 16) : "",
      }}
    />
  );
}
