"use client";

import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { formatDate } from "@/lib/format";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export interface HeaderUser {
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  accessUntil: string | null;
}

interface HeaderProps {
  currentUser: HeaderUser;
  language: Language;
}

export function Header({ currentUser, language }: HeaderProps) {
  const router = useRouter();
  const t = getDictionary(language);
  const navItems = [t.navAllIdeas, t.navActive, t.navStats];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-4 z-30 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="glass-panel flex flex-col gap-4 rounded-3xl px-5 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/18 to-white/6 shadow-glow">
            <span className="text-lg font-black text-blue">{t.logo}</span>
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-black tracking-normal text-text sm:text-3xl">
              {t.brand}
            </h1>
            <p className="mt-1 text-sm font-medium text-muted sm:text-base">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <nav className="flex gap-2 overflow-x-auto pb-1 sm:pb-0" aria-label="Разделы">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                className="glass-button shrink-0 rounded-full px-4 py-2.5 text-sm font-bold"
              >
                {item}
              </button>
            ))}
            {currentUser.role === "ADMIN" ? (
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="shrink-0 rounded-full border border-blue/35 bg-blue/15 px-4 py-2.5 text-sm font-black text-blue transition hover:bg-blue/20"
              >
                Админка
              </button>
            ) : null}
          </nav>
          <LanguageSwitcher language={language} />

          <div className="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.055] px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-text">
                {currentUser.name || currentUser.email}
              </p>
              <p className="text-xs font-semibold text-muted">
                {currentUser.role === "ADMIN" ? t.roleAdmin : t.roleUser}
                {currentUser.accessUntil ? ` · ${formatDate(currentUser.accessUntil)}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-black text-muted transition hover:text-text"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
