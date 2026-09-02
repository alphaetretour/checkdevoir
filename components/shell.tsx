"use client";

export async function logout() {
  await fetch("/api/logout", { method: "POST" });
  window.location.reload();
}

export function Shell({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-accent uppercase">
            {eyebrow}
          </p>
          <h1 className="display mt-1 text-4xl leading-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </header>
      {children}
    </main>
  );
}

export function GhostButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-line bg-card px-4 py-2 text-sm font-semibold"
    >
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    todo: "bg-[#efe4d4] text-ink",
    submitted: "bg-[#dce8f4] text-sky",
    approved: "bg-[#dceee4] text-forest",
    rejected: "bg-[#f6ddd3] text-accent",
  };
  const labels: Record<string, string> = {
    todo: "À faire",
    submitted: "Photo envoyée",
    approved: "Validé",
    rejected: "À reprendre",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}
