import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { AuthError, requireRole } from "@/lib/session";
import { readStore, uploadsDir } from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole();
    const { id } = await context.params;
    const store = await readStore();
    const item = store.homework.find((h) => h.id === id);
    if (!item?.photoFilename) {
      return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
    }
    const filePath = path.join(/*turbopackIgnore: true*/ uploadsDir(), item.photoFilename);
    const data = await readFile(filePath);
    const ext = path.extname(item.photoFilename).toLowerCase();
    const type =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : "image/jpeg";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  }
}
