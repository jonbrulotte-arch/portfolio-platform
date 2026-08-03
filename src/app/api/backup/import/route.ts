import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { restoreBackup, ensureBackupDir } from "@/lib/backup";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const ROOT = process.cwd();
const BACKUP_DIR = path.join(ROOT, "backups");

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.name.endsWith(".enc")) return NextResponse.json({ error: "File must be a .enc backup" }, { status: 400 });

    ensureBackupDir();

    // Sanitise filename — strip any path components
    const filename = path.basename(file.name);
    const destPath = path.join(BACKUP_DIR, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(destPath, Buffer.from(bytes));

    // Restore immediately from the uploaded file
    restoreBackup(filename);

    return NextResponse.json({ ok: true, filename });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
