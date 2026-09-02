import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { newId } from "@/lib/crypto";
import { toPublic } from "@/lib/homework";
import { AuthError, requireRole } from "@/lib/session";
import { updateStore, uploadsDir } from "@/lib/store";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole("child");
    const { id } = await context.params;
    const form = await request.formData();
    const file = form.get("photo");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Aucune photo reçue." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "La photo est trop lourde (8 Mo max)." },
        { status: 400 },
      );
    }
    const type = file.type || "image/jpeg";
    if (!ALLOWED.has(type) && !type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Envoie une image (JPG, PNG ou photo téléphone)." },
        { status: 400 },
      );
    }

    const ext =
      type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
    const filename = `${id}-${newId()}.${ext}`;
    const dir = uploadsDir();
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(/*turbopackIgnore: true*/ dir, filename), buffer);

    const now = new Date().toISOString();
    const updated = await updateStore((store) => {
      const item = store.homework.find((h) => h.id === id);
      if (!item) return store;
      item.photoFilename = filename;
      item.status = "submitted";
      item.submittedAt = now;
      item.reviewedAt = null;
      item.reviewComment = "";
      item.grantedScreenMinutes = null;
      item.grantedAt = null;
      return store;
    });

    const item = updated.homework.find((h) => h.id === id);
    if (!item) {
      return NextResponse.json({ error: "Devoir introuvable." }, { status: 404 });
    }
    return NextResponse.json({ homework: toPublic(item) });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
