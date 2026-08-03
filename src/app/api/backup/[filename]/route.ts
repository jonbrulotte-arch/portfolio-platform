import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteBackup, restoreBackup, readBackupFile } from "@/lib/backup";

export const dynamic = "force-dynamic";

interface Params { params: { filename: string } }

// Download backup file
export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = readBackupFile(params.filename);
    return new NextResponse(data.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${params.filename}"`,
        "Content-Length": String(data.length),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}

// Restore from backup
export async function POST(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    restoreBackup(params.filename);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Delete backup
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    deleteBackup(params.filename);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
