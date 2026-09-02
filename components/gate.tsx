"use client";

import { useState } from "react";
import type { Role } from "@/lib/types";

export function Gate({
  needsSetup,
  onReady,
}: {
  needsSetup: boolean;
  onReady: () => void;
}) {
  if (needsSetup) {
    return <SetupForm onReady={onReady} />;
  }
  return <LoginForm onReady={onReady} />;
}

function SetupForm({ onReady }: { onReady: () => void }) {
  const [familyName, setFamilyName] = useState("");
  const [childName, setChildName] = useState("");
  const [parentPin, setParentPin] = useState("");
  const [childPin, setChildPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyName, childName, parentPin, childPin }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Impossible de créer la famille.");
      return;
    }
    onReady();
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-10">
      <p className="mb-2 text-sm font-medium tracking-wide text-accent uppercase">
        Première utilisation
      </p>
      <h1 className="display text-4xl leading-tight">Homework Check</h1>
      <p className="mt-3 text-muted">
        Créez un espace famille : l&apos;enfant ajoute ses devoirs et envoie une
        photo, le parent vérifie puis ouvre Family Safety pour ajouter du temps
        d&apos;écran.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-line bg-card p-6 shadow-sm">
        <Field label="Nom de la famille" value={familyName} onChange={setFamilyName} placeholder="Famille Dupont" />
        <Field label="Prénom de l'enfant" value={childName} onChange={setChildName} placeholder="Léa" />
        <Field
          label="PIN parent (4 à 8 chiffres)"
          value={parentPin}
          onChange={setParentPin}
          inputMode="numeric"
          type="password"
          autoComplete="new-password"
        />
        <Field
          label="PIN enfant (4 à 8 chiffres, différent)"
          value={childPin}
          onChange={setChildPin}
          inputMode="numeric"
          type="password"
          autoComplete="new-password"
        />
        {error ? <p className="text-sm text-accent">{error}</p> : null}
        <button
          disabled={busy}
          className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-paper disabled:opacity-60"
        >
          {busy ? "Création…" : "Créer l'espace famille"}
        </button>
      </form>
    </main>
  );
}

function LoginForm({ onReady }: { onReady: () => void }) {
  const [role, setRole] = useState<Role>("child");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, pin }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Connexion impossible.");
      return;
    }
    onReady();
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-10">
      <h1 className="display text-4xl">Homework Check</h1>
      <p className="mt-2 text-muted">Choisis qui se connecte, puis entre le code PIN.</p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-line bg-card p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <RoleButton active={role === "child"} onClick={() => setRole("child")}>
            Enfant
          </RoleButton>
          <RoleButton active={role === "parent"} onClick={() => setRole("parent")}>
            Parent
          </RoleButton>
        </div>
        <Field
          label="Code PIN"
          value={pin}
          onChange={setPin}
          inputMode="numeric"
          type="password"
          autoComplete="current-password"
        />
        {error ? <p className="text-sm text-accent">{error}</p> : null}
        <button
          disabled={busy}
          className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-paper disabled:opacity-60"
        >
          {busy ? "Connexion…" : "Entrer"}
        </button>
      </form>
    </main>
  );
}

function RoleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
        active ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-muted">{label}</span>
      <input
        className="w-full rounded-2xl border border-line bg-paper px-3 py-3 outline-none ring-ink/20 focus:ring-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required
      />
    </label>
  );
}
