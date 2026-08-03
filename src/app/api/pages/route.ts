import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(pages);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, slug, content, status, inNav, navOrder, seoTitle, seoDesc, ogImage, scheduledAt } = await req.json();
  const page = await prisma.page.create({
    data: {
      title,
      slug: slug || slugify(title),
      content: content || null,
      status,
      inNav: !!inNav,
      navOrder: navOrder ?? 0,
      seoTitle: seoTitle || null,
      seoDesc: seoDesc || null,
      ogImage: ogImage || null,
      publishedAt: status === "published" ? new Date() : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });
  return NextResponse.json(page, { status: 201 });
}
