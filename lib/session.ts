import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Role, SessionPayload } from "./types";

const COOKIE = "homework_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30;

async function secret(): Promise<string> {
  const dir = path.join(process.cwd(), "data");
  const file = path.join(dir, "secret.txt");
  await mkdir(dir, { recursive: true });
  try {
    return (await readFile(file, "utf8")).trim();
  } catch {
    const value = createHmac("sha256", `${Date.now()}-${Math.random()}`)
      .update("homework-check")
      .digest("hex");
    await writeFile(file, value, "utf8");
    return value;
  }
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export async function createSession(role: Role): Promise<void> {
  const key = await secret();
  const payload: SessionPayload = {
    role,
    exp: Date.now() + MAX_AGE_SEC * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const token = `${body}.${sign(body, key)}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const key = await secret();
  const expected = sign(body, key);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    if (payload.role !== "child" && payload.role !== "parent") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function requireRole(role?: Role): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new AuthError("Non connecté", 401);
  }
  if (role && session.role !== role) {
    throw new AuthError("Accès refusé", 403);
  }
  return session;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
