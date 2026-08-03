import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const cats = await prisma.blogCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { posts: { where: { status: "published" } } } } },
  });
  return NextResponse.json(cats);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, color, sortOrder } = await req.json();
  const cat = await prisma.blogCategory.create({
    data: { name, slug: slugify(name), color: color || null, sortOrder: sortOrder ?? 0 },
  });
  return NextResponse.json(cat, { status: 201 });
}
