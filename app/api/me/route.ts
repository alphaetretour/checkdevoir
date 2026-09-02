import { NextResponse } from "next/server";
import { toPublic } from "@/lib/homework";
import { AuthError, getSession } from "@/lib/session";
import { readStore } from "@/lib/store";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null, family: null, homework: [] });
    }
    const store = await readStore();
    return NextResponse.json({
      user: { role: session.role },
      family: store.family
        ? { name: store.family.name, childName: store.family.childName }
        : null,
      homework: store.homework
        .map(toPublic)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      needsSetup: !store.family,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
