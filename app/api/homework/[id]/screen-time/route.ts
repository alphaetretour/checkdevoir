import { NextResponse } from "next/server";
import { toPublic } from "@/lib/homework";
import { AuthError, requireRole } from "@/lib/session";
import { updateStore } from "@/lib/store";
import { FAMILY_SAFETY_URL } from "@/lib/types";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole("parent");
    const { id } = await context.params;
    const body = (await request.json()) as { minutes?: number };
    const minutes = Number(body.minutes);
    if (![15, 20, 30, 45, 60].includes(minutes)) {
      return NextResponse.json(
        { error: "Choisis 15, 20, 30, 45 ou 60 minutes." },
        { status: 400 },
      );
    }

    const updated = await updateStore((store) => {
      const item = store.homework.find((h) => h.id === id);
      if (!item || item.status !== "approved") return store;
      item.grantedScreenMinutes = minutes;
      item.grantedAt = new Date().toISOString();
      return store;
    });

    const item = updated.homework.find((h) => h.id === id);
    if (!item) {
      return NextResponse.json({ error: "Devoir introuvable." }, { status: 404 });
    }
    if (item.status !== "approved") {
      return NextResponse.json(
        { error: "Valide d'abord le devoir avant d'ajouter du temps d'écran." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      homework: toPublic(item),
      familySafetyUrl: FAMILY_SAFETY_URL,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
