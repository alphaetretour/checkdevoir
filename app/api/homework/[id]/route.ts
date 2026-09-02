import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { AuthError, requireRole } from "@/lib/session";
import { updateStore, uploadsDir } from "@/lib/store";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole("parent");
    const { id } = await context.params;
    let photoFilename: string | null = null;
    let found = false;

    await updateStore((store) => {
      const item = store.homework.find((h) => h.id === id);
      if (!item) return store;
      found = true;
      photoFilename = item.photoFilename;
      store.homework = store.homework.filter((h) => h.id !== id);
      return store;
    });

    if (!found) {
      return NextResponse.json({ error: "Devoir introuvable." }, { status: 404 });
    }

    if (photoFilename) {
      try {
        await unlink(path.join(/*turbopackIgnore: true*/ uploadsDir(), photoFilename));
      } catch {
        // Photo already gone; the homework is still removed from the list.
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
