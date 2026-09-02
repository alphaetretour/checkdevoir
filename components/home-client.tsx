"use client";

import { useState } from "react";
import { ChildHome } from "@/components/child-home";
import { Gate } from "@/components/gate";
import { ParentHome } from "@/components/parent-home";
import type { PublicHomework, Role } from "@/lib/types";

type Me = {
  user: { role: Role } | null;
  family: { name: string; childName: string } | null;
  homework: PublicHomework[];
};

export function HomeClient({ initial }: { initial: Me }) {
  const [me, setMe] = useState(initial);

  async function refresh() {
    const res = await fetch("/api/me", { cache: "no-store" });
    if (!res.ok) return;
    setMe((await res.json()) as Me);
  }

  if (!me.user || !me.family) {
    return <Gate needsSetup={!me.family} onReady={() => void refresh()} />;
  }

  if (me.user.role === "parent") {
    return (
      <ParentHome family={me.family} homework={me.homework} onChange={() => void refresh()} />
    );
  }

  return (
    <ChildHome family={me.family} homework={me.homework} onChange={() => void refresh()} />
  );
}
