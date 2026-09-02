"use client";

import { useMemo, useState } from "react";
import { GhostButton, Shell, StatusBadge, logout } from "@/components/shell";
import { FAMILY_SAFETY_URL, type PublicHomework } from "@/lib/types";

export function ParentHome({
  family,
  homework,
  onChange,
}: {
  family: { name: string; childName: string };
  homework: PublicHomework[];
  onChange: () => void;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const pending = useMemo(
    () => homework.filter((item) => item.status === "submitted"),
    [homework],
  );
  const isIOS = typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <Shell
      eyebrow={`${family.name} · espace parent`}
      title="Vérifier les devoirs"
      actions={<GhostButton onClick={() => void logout()}>Déconnexion</GhostButton>}
    >
      <p className="mb-6 text-muted">
        {family.childName} envoie une photo de chaque devoir. Après validation, ouvre
        Microsoft Family Safety pour ajouter le temps d&apos;écran (Microsoft ne
        propose pas d&apos;API officielle pour le faire automatiquement).
      </p>
      <div className="mb-6 flex items-center gap-3">
        {pending.length > 0 ? (
          <p className="rounded-2xl bg-[#dce8f4] px-4 py-3 text-sm font-medium text-sky">
            {pending.length} devoir{pending.length > 1 ? "s" : ""} en attente de
            vérification.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="rounded-2xl border border-line px-4 py-2 text-sm font-semibold"
        >
          {showHistory ? "Masquer anciens devoirs" : "Voir anciens devoirs"}
        </button>
      </div>
      {showHistory ? (
        <ul className="space-y-4">
          {homework.length === 0 ? (
            <li className="rounded-3xl border border-dashed border-line bg-card/70 p-6 text-muted">
              Aucun devoir pour le moment.
            </li>
          ) : (
            homework.map((item) => (
              <li key={item.id}>
                <ParentCard item={item} childName={family.childName} onChange={onChange} />
              </li>
            ))
          )}
        </ul>
      ) : (
        <ul className="space-y-4">
          {homework.filter(item => item.status === "submitted" || item.status === "todo").length === 0 ? (
            <li className="rounded-3xl border border-dashed border-line bg-card/70 p-6 text-muted">
              Aucun devoir en attente.
            </li>
          ) : (
            homework.filter(item => item.status === "submitted" || item.status === "todo").map((item) => (
              <li key={item.id}>
                <ParentCard item={item} childName={family.childName} onChange={onChange} />
              </li>
            ))
          )}
        </ul>
      )}
    </Shell>
  );
}

function ParentCard({
  item,
  childName,
  onChange,
}: {
  item: PublicHomework;
  childName: string;
  onChange: () => void;
}) {
  const [comment, setComment] = useState(item.reviewComment);
  const [minutes, setMinutes] = useState(item.requestedScreenMinutes);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function review(decision: "approved" | "rejected") {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/homework/${item.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, comment }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Action impossible.");
      return;
    }
    onChange();
  }

  async function markScreenTime() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/homework/${item.id}/screen-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Impossible d'enregistrer le temps d'écran.");
      return;
    }
    window.open(FAMILY_SAFETY_URL, "_blank", "noopener,noreferrer");
    onChange();
  }

  async function markDone() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/homework/${item.id}`, { method: "DELETE" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Impossible de retirer le devoir.");
      return;
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
      <p className="mt-3 whitespace-pre-wrap text-sm">{item.statement}</p>
      {item.dueDate ? (
        <p className="mt-2 text-xs text-muted">Date de rendu : {item.dueDate}</p>
      ) : null}
      {item.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.photoUrl}
          alt={`Photo envoyée par ${childName}`}
          className="mt-4 max-h-96 w-full rounded-2xl object-contain bg-paper"
        />
      ) : (
        <p className="mt-4 rounded-2xl bg-paper px-3 py-3 text-sm text-muted">
          Pas encore de photo. {childName} doit prendre le document en photo.
        </p>
      )}

      {item.status === "submitted" ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="w-full rounded-2xl border border-line bg-paper px-3 py-3 text-sm"
            placeholder="Commentaire pour l'enfant (optionnel)"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void review("approved")}
              className="rounded-2xl bg-forest px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              Valider le devoir
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void review("rejected")}
              className="rounded-2xl border border-line px-4 py-3 text-sm font-semibold disabled:opacity-60"
            >
              Demander une reprise
            </button>
          </div>
        </div>
      ) : null}

      {item.status === "approved" ? (
        <div className="mt-5 rounded-2xl border border-[#c9e3d4] bg-[#eef7f1] p-4">
          <p className="text-sm font-semibold text-forest">Temps d&apos;écran Family Safety</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink/80">
            <li>Ouvre Family Safety avec le compte Microsoft parent.</li>
            <li>Choisis {childName}, puis Temps d&apos;écran.</li>
            <li>Ajoute {minutes} minutes (ou le bonus que tu veux).</li>
            <li>Reviens ici : le bonus est noté dans Homework Check.</li>
          </ol>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="rounded-2xl border border-line bg-white px-3 py-2 text-sm"
            >
              {[15, 20, 30, 45, 60].map((n) => (
                <option key={n} value={n}>
                  {n} min
                </option>
              ))}
            </select>
            {typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) ? (
              <a
                href="microsoft-familysafety://"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-sky px-4 py-2 text-sm font-semibold text-white"
              >
                Ouvrir Family Safety
              </a>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void markScreenTime()}
                className="rounded-2xl bg-sky px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Ouvrir Family Safety
              </button>
            )}
            <a
              href={FAMILY_SAFETY_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-sky underline"
            >
              account.microsoft.com/family
            </a>
          </div>
          {item.grantedScreenMinutes ? (
            <p className="mt-3 text-sm text-forest">
              Bonus noté : {item.grantedScreenMinutes} min
              {item.grantedAt
                ? ` le ${item.grantedAt.replace("T", " ").slice(0, 16)}`
                : ""}
              .
            </p>
          ) : null}
        </div>
      ) : null}

      {item.status === "rejected" && item.reviewComment ? (
        <p className="mt-3 text-sm text-accent">Commentaire : {item.reviewComment}</p>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => void markDone()}
        className="mt-4 w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-paper disabled:opacity-60"
      >
        C&apos;est fait
      </button>
      {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}
    </article>
  );
}
