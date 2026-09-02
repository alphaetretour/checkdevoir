import { HomeClient } from "@/components/home-client";
import { toPublic } from "@/lib/homework";
import { getSession } from "@/lib/session";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  const store = await readStore();
  const family = store.family
    ? { name: store.family.name, childName: store.family.childName }
    : null;

  return (
    <HomeClient
      initial={{
        user: session ? { role: session.role } : null,
        family,
        homework: store.homework
          .map(toPublic)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      }}
    />
  );
}
