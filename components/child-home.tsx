"use client";

import { useState } from "react";
import { CameraButton } from "@/components/camera-button";
import { GhostButton, Shell, StatusBadge, logout } from "@/components/shell";
import type { PublicHomework } from "@/lib/types";
import { SUBJECTS } from "@/lib/types";

export function ChildHome({
  family,
  homework,
  onChange,
}: {
  family: { name: string; childName: string };
  homework: PublicHomework[];
  onChange: () => void;
}) {
  return (
    <Shell
      eyebrow={`${family.name} · espace enfant`}
      title={`Salut ${family.childName}`}
      actions={<GhostButton onClick={() => void logout()}>Déconnexion</GhostButton>}
    >
      <HomeworkForm onCreated={onChange} />
      <section className="mt-10">
        <h2 className="display text-2xl">Tes devoirs</h2>
        <p className="mt-1 text-sm text-muted">
          Quand un devoir est fini, prends une photo : elle part sur le compte parent.
        </p>
        <ul className="mt-5 space-y-4">
          {homework.length === 0 ? (
            <li className="rounded-3xl border border-dashed border-line bg-card/70 p-6 text-muted">
              Aucun devoir pour l&apos;instant. Ajoute le premier ci-dessus.
            </li>
          ) : (
            homework.map((item) => (
              <li key={item.id}>
                <HomeworkCard item={item} onChange={onChange} />
              </li>
            ))
          )}
        </ul>
      </section>
    </Shell>
  );
}

function HomeworkForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState("");
  const [statement, setStatement] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [minutes, setMinutes] = useState(15);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        subject: subject === "Autre" ? customSubject || "Autre" : subject,
        statement,
        notes,
        dueDate,
        requestedScreenMinutes: minutes,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Impossible d'ajouter le devoir.");
      return;
    }
    setTitle("");
    setStatement("");
    setNotes("");
    setDueDate("");
    setOpen(false);
    onCreated();
  }

  return (
    <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="display text-2xl">Nouveau devoir</h2>
          <p className="text-sm text-muted">Titre, matière, énoncé, date et temps d&apos;écran demandé.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          {open ? "Fermer" : "Ajouter"}
        </button>
      </div>
      {open ? (
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-muted">Titre</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper px-3 py-3"
              placeholder="Exercices page 42"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-muted">Matière</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper px-3 py-3"
            >
              {SUBJECTS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          {subject === "Autre" ? (
            <input
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper px-3 py-3"
              placeholder="Nom de la matière"
            />
          ) : null}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-muted">Énoncé / consignes</span>
            <textarea
              required
              rows={4}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper px-3 py-3"
              placeholder="Recopie l'énoncé ou les consignes du professeur."
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-muted">Notes (optionnel)</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper px-3 py-3"
              placeholder="Cahier d'exercices, à rendre en classe…"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-muted">Date de rendu</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-line bg-paper px-3 py-3"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-muted">Temps d&apos;écran demandé</span>
              <select
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full rounded-2xl border border-line bg-paper px-3 py-3"
              >
                {[15, 20, 30, 45, 60].map((n) => (
                  <option key={n} value={n}>
                    {n} minutes
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error ? <p className="text-sm text-accent">{error}</p> : null}
          <button
            disabled={busy}
            className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-paper disabled:opacity-60"
          >
            {busy ? "Ajout…" : "Ajouter à la liste"}
          </button>
        </form>
      ) : null}
    </section>
  );
}

function HomeworkCard({
  item,
  onChange,
}: {
  item: PublicHomework;
  onChange: () => void;
}) {
  async function sendPhoto(file: File) {
    const form = new FormData();
    form.append("photo", file);
    const res = await fetch(`/api/homework/${item.id}/photo`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Envoi de la photo impossible.");
    }
    onChange();
  }

  return (
    <article className="rounded-3xl border border-line bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-sky uppercase">{item.subject}</p>
          <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-ink/90">{item.statement}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
        {item.dueDate ? <span>Rendu : {item.dueDate}</span> : null}
        <span>Récompense : {item.requestedScreenMinutes} min</span>
      </div>
      {item.notes ? <p className="mt-2 text-sm text-muted">{item.notes}</p> : null}
      {item.reviewComment ? (
        <p className="mt-3 rounded-2xl bg-paper px-3 py-2 text-sm">
          Message du parent : {item.reviewComment}
        </p>
      ) : null}
      {item.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.photoUrl}
          alt={`Photo du devoir ${item.title}`}
          className="mt-4 max-h-64 w-full rounded-2xl object-cover"
        />
      ) : null}
      {item.status === "approved" && item.grantedScreenMinutes ? (
        <p className="mt-3 text-sm font-medium text-forest">
          Temps d&apos;écran noté : {item.grantedScreenMinutes} min via Family Safety.
        </p>
      ) : null}
      {item.status !== "approved" ? (
        <div className="mt-4">
          <CameraButton
            onFile={sendPhoto}
            label={item.photoUrl ? "Renvoyer une photo" : "Prendre une photo du document"}
          />
        </div>
      ) : null}
    </article>
  );
}
