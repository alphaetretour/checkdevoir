import { NextResponse } from "next/server";
import { hashPin } from "@/lib/crypto";
import { createSession } from "@/lib/session";
import { readStore, writeStore } from "@/lib/store";

function validPin(pin: unknown): pin is string {
  return typeof pin === "string" && /^\d{4,8}$/.test(pin);
}

export async function POST(request: Request) {
  const store = await readStore();
  if (store.family) {
    return NextResponse.json(
      { error: "La famille est déjà configurée." },
      { status: 409 },
    );
  }

  const body = (await request.json()) as {
    familyName?: string;
    childName?: string;
    parentPin?: string;
    childPin?: string;
  };

  const familyName = body.familyName?.trim() ?? "";
  const childName = body.childName?.trim() ?? "";
  if (familyName.length < 2) {
    return NextResponse.json(
      { error: "Donne un nom de famille (au moins 2 lettres)." },
      { status: 400 },
    );
  }
  if (childName.length < 2) {
    return NextResponse.json(
      { error: "Donne le prénom de l'enfant." },
      { status: 400 },
    );
  }
  if (!validPin(body.parentPin) || !validPin(body.childPin)) {
    return NextResponse.json(
      { error: "Les codes PIN doivent contenir 4 à 8 chiffres." },
      { status: 400 },
    );
  }
  if (body.parentPin === body.childPin) {
    return NextResponse.json(
      { error: "Choisis des PIN différents pour le parent et l'enfant." },
      { status: 400 },
    );
  }

  store.family = {
    name: familyName,
    childName,
    parentPinHash: hashPin(body.parentPin),
    childPinHash: hashPin(body.childPin),
    createdAt: new Date().toISOString(),
  };
  await writeStore(store);
  await createSession("parent");
  return NextResponse.json({ ok: true, role: "parent" });
}
