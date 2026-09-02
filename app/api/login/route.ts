import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/crypto";
import { createSession } from "@/lib/session";
import { readStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export async function POST(request: Request) {
  const store = await readStore();
  if (!store.family) {
    return NextResponse.json(
      { error: "La famille n'est pas encore configurée." },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { role?: Role; pin?: string };
  if (body.role !== "child" && body.role !== "parent") {
    return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
  }
  if (typeof body.pin !== "string") {
    return NextResponse.json({ error: "PIN manquant." }, { status: 400 });
  }

  const hash =
    body.role === "parent"
      ? store.family.parentPinHash
      : store.family.childPinHash;
  if (!verifyPin(body.pin, hash)) {
    return NextResponse.json({ error: "Code PIN incorrect." }, { status: 401 });
  }

  await createSession(body.role);
  return NextResponse.json({ ok: true, role: body.role });
}
