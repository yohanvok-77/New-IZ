"use client";

import type { UserRole, UserStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

interface AccessActionsProps {
  userId: string;
  role: UserRole;
  status: UserStatus;
  language: Language;
}

const durations = [
  ["7d", "7 дней"],
  ["1m", "1 месяц"],
  ["3m", "3 месяца"],
  ["6m", "6 месяцев"],
  ["12m", "12 месяцев"],
] as const;

export function AccessActions({ userId, role, status, language }: AccessActionsProps) {
  const router = useRouter();
  const t = getDictionary(language);
  const [loading, setLoading] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [error, setError] = useState("");

  async function run(action: string, payload: Record<string, unknown> = {}) {
    setError("");
    setLoading(action + JSON.stringify(payload));

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await response.json();

    setLoading("");

    if (!response.ok) {
      setError(data.message || t.actionFailed);
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-3">
      <p className="text-xs font-semibold text-muted">
        {t.grantHint}
      </p>
      <div className="flex flex-wrap gap-2">
        {durations.map(([duration, label]) => (
          <button
            key={duration}
            type="button"
            disabled={Boolean(loading)}
            onClick={() => run("grant", { duration })}
            className="rounded-full border border-blue/25 bg-blue/10 px-3 py-2 text-xs font-black text-blue transition hover:bg-blue/15 disabled:opacity-60"
          >
            {{ "7d": t.grant7d, "1m": t.grant1m, "3m": t.grant3m, "6m": t.grant6m, "12m": t.grant12m }[duration]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="date"
          value={customDate}
          onChange={(event) => setCustomDate(event.target.value)}
          className="min-w-0 rounded-2xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-text outline-none"
        />
        <button
          type="button"
          disabled={!customDate || Boolean(loading)}
          onClick={() => run("grant", { duration: "custom", customDate })}
          className="rounded-2xl border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-black text-gold transition hover:bg-gold/15 disabled:opacity-60"
        >
          {t.customDate}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-black text-muted hover:text-text" type="button" onClick={() => run("revoke")}>
          {t.revokeAccess}
        </button>
        <button className="rounded-full border border-danger/25 bg-danger/10 px-3 py-2 text-xs font-black text-danger hover:bg-danger/15" type="button" onClick={() => run(status === "BLOCKED" ? "unblock" : "block")}>
          {status === "BLOCKED" ? t.unblock : t.block}
        </button>
        <button className="rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-black text-muted hover:text-text" type="button" onClick={() => run("role", { role: role === "ADMIN" ? "USER" : "ADMIN" })}>
          {role === "ADMIN" ? t.makeUser : t.makeAdmin}
        </button>
      </div>

      {error ? <p className="rounded-2xl border border-danger/25 bg-danger/10 p-3 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
