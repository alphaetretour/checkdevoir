import { NextResponse } from "next/server";
import { newId } from "@/lib/crypto";
import { toPublic } from "@/lib/homework";
import { AuthError, requireRole } from "@/lib/session";
import { readStore, updateStore } from "@/lib/store";
import type { Homework } from "@/lib/types";

export async function GET() {
  try {
    await requireRole();
    const store = await readStore();
    return NextResponse.json({
      homework: store.homework
        .map(toPublic)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("child");
    const body = (await request.json()) as Partial<Homework>;
    const title = body.title?.trim() ?? "";
    const subject = body.subject?.trim() ?? "";
    const statement = body.statement?.trim() ?? "";
    if (title.length < 2) {
      return NextResponse.json({ error: "Le titre est trop court." }, { status: 400 });
    }
    if (subject.length < 2) {
      return NextResponse.json({ error: "Indique la matière." }, { status: 400 });
    }
    if (statement.length < 4) {
      return NextResponse.json(
        { error: "Ajoute l'énoncé ou les consignes du devoir." },
        { status: 400 },
      );
    }

    const minutes = Number(body.requestedScreenMinutes ?? 15);
    const requestedScreenMinutes = [15, 20, 30, 45, 60].includes(minutes)
      ? minutes
      : 15;

    const item: Homework = {
      id: newId(),
      title,
      subject,
      statement,
      notes: (body.notes ?? "").toString().trim(),
      dueDate: (body.dueDate ?? "").toString(),
      requestedScreenMinutes,
      status: "todo",
      photoFilename: null,
      submittedAt: null,
      reviewedAt: null,
      reviewComment: "",
      grantedScreenMinutes: null,
      grantedAt: null,
      createdAt: new Date().toISOString(),
    };

    await updateStore((store) => {
      store.homework.unshift(item);
      return store;
    });

    return NextResponse.json({ homework: toPublic(item) }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
