"use client";

import type { UserRole, UserStatus } from "@prisma/client";
import { useMemo, useState } from "react";
import { AccessActions } from "@/components/admin/AccessActions";
import { RoleBadge, UserAccessBadge } from "@/components/admin/UserAccessBadge";
import { formatDate, getRemainingAccessDays } from "@/lib/format";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  accessUntil: string | null;
  createdAt: string;
}

type Filter = "all" | "active" | "none" | "expired" | "blocked";

export function UsersTable({ users, language }: { users: AdminUserRow[]; language: Language }) {
  const t = getDictionary(language);
  const filters: Array<{ label: string; value: Filter }> = [
    { label: t.all, value: "all" },
    { label: t.withActiveAccess, value: "active" },
    { label: t.noAccess, value: "none" },
    { label: t.expiredAccess, value: "expired" },
    { label: t.blocked, value: "blocked" },
  ];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        (user.name || "").toLowerCase().includes(normalizedQuery);
      const accessUntil = user.accessUntil ? new Date(user.accessUntil) : null;
      const hasActive = Boolean(accessUntil && accessUntil.getTime() > Date.now() && user.status !== "BLOCKED");
      const expired = Boolean(accessUntil && accessUntil.getTime() <= Date.now());

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && hasActive) ||
        (filter === "none" && !user.accessUntil && user.status !== "BLOCKED") ||
        (filter === "expired" && expired) ||
        (filter === "blocked" && user.status === "BLOCKED");

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, users]);

  return (
    <section className="grid gap-4">
      <div className="glass-panel rounded-3xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchUsers}
            className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-text outline-none transition focus:border-blue/60 lg:max-w-sm"
          />
          <div className="flex gap-2 overflow-x-auto">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={[
                  "shrink-0 rounded-full px-4 py-2.5 text-sm font-black transition",
                  filter === item.value ? "bg-blue text-white shadow-glow" : "glass-button",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredUsers.map((user) => {
        const days = getRemainingAccessDays(user.accessUntil);

        return (
          <article key={user.id} className="glass-panel rounded-3xl p-5">
            <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr] xl:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <UserAccessBadge accessUntil={user.accessUntil} status={user.status} language={language} />
                  <RoleBadge role={user.role} language={language} />
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-normal">{user.name || t.noName}</h2>
                <p className="mt-1 text-sm font-semibold text-muted">{user.email}</p>
                <dl className="mt-4 grid gap-2 text-sm">
                  <div className="flex justify-between gap-4 border-b border-white/10 py-2">
                    <dt className="text-muted">{t.created}</dt>
                    <dd className="font-bold">{formatDate(user.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-white/10 py-2">
                    <dt className="text-muted">Access until</dt>
                    <dd className="font-bold">{formatDate(user.accessUntil)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2">
                    <dt className="text-muted">{t.remainingDays}</dt>
                    <dd className="font-bold">{days === null ? "—" : days}</dd>
                  </div>
                </dl>
              </div>

              <AccessActions userId={user.id} role={user.role} status={user.status} language={language} />
            </div>
          </article>
        );
      })}

      {filteredUsers.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 text-center text-muted">{t.usersNotFound}</div>
      ) : null}
    </section>
  );
}
