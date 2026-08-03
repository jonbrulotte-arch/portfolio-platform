import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, slug, content, status, inNav, navOrder, seoTitle, seoDesc, ogImage, heroImage, heroImageAlt, scheduledAt } = await req.json();
  const existing = await prisma.page.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const publishedAt =
    status === "published" && existing.status !== "published" ? new Date() : existing.publishedAt;

  const page = await prisma.page.update({
    where: { id: params.id },
    data: {
      title, slug, content: content || null, status,
      inNav: !!inNav, navOrder: navOrder ?? 0,
      seoTitle: seoTitle || null, seoDesc: seoDesc || null, ogImage: ogImage || null,
      heroImage: heroImage || null, heroImageAlt: heroImageAlt || null,
      publishedAt, scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });
  // Revalidate the old slug (in case it changed) and the new one
  revalidatePath(`/${existing.slug}`);
  revalidatePath(`/${page.slug}`);
  revalidatePath("/", "layout"); // nav may have changed
  return NextResponse.json(page);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const page = await prisma.page.findUnique({ where: { id: params.id }, select: { slug: true } });
  await prisma.page.delete({ where: { id: params.id } });
  if (page) revalidatePath(`/${page.slug}`);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
