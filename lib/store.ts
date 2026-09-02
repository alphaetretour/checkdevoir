import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StoreData } from "./types";

// Use TMPDIR on Netlify/production (serverless: read-write only in tmp dir), fall back to ./data in dev
const isNetlify = process.env.NETLIFY || process.env.NODE_ENV === "production";
const tmpDir = process.env.TMPDIR || "/tmp";
const dataDir = isNetlify ? path.join(tmpDir, "homework-check") : path.join(process.cwd(), "data");
const storePath = path.join(dataDir, "store.json");
const tmpPath = path.join(dataDir, "store.json.tmp");

const empty: StoreData = { family: null, homework: [] };

async function ensureDir() {
  await mkdir(dataDir, { recursive: true });
}

export async function readStore(): Promise<StoreData> {
  await ensureDir();
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as StoreData;
    return {
      family: parsed.family ?? null,
      homework: Array.isArray(parsed.homework) ? parsed.homework : [],
    };
  } catch {
    return empty;
  }
}

export async function writeStore(data: StoreData): Promise<void> {
  await ensureDir();
  const json = JSON.stringify(data, null, 2);
  await writeFile(storePath, json, "utf8");
}

export async function updateStore(
  updater: (current: StoreData) => StoreData | Promise<StoreData>,
): Promise<StoreData> {
  const current = await readStore();
  const next = await updater(current);
  await writeStore(next);
  return next;
}

export function uploadsDir(): string {
  return path.join(dataDir, "uploads");
}
