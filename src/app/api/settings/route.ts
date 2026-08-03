import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings, setSetting } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await Promise.all(Object.entries(body).map(([k, v]) => setSetting(k, String(v))));

  // Purge the Next.js full-route cache for all public pages so the new
  // settings (site name, nav, footer, etc.) take effect immediately.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
