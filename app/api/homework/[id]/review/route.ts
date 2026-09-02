import { NextResponse } from "next/server";
import { toPublic } from "@/lib/homework";
import { AuthError, requireRole } from "@/lib/session";
import { readStore, updateStore } from "@/lib/store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole("parent");
    const { id } = await context.params;
    const body = (await request.json()) as {
      decision?: "approved" | "rejected";
      comment?: string;
    };
    if (body.decision !== "approved" && body.decision !== "rejected") {
      return NextResponse.json({ error: "Décision invalide." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const current = await readStore();
    const existing = current.homework.find((h) => h.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Devoir introuvable." }, { status: 404 });
    }
    if (!existing.photoFilename || existing.status === "todo") {
      return NextResponse.json(
        { error: "Ce devoir n'a pas encore de photo à vérifier." },
        { status: 400 },
      );
    }

    const updated = await updateStore((store) => {
      const item = store.homework.find((h) => h.id === id);
      if (!item) return store;
      item.status = body.decision!;
      item.reviewedAt = now;
      item.reviewComment = (body.comment ?? "").toString().trim();
      if (body.decision === "rejected") {
        item.grantedScreenMinutes = null;
        item.grantedAt = null;
      }
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
