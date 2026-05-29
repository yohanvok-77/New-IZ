"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { HeaderUser } from "@/components/Header";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

interface AdminLayoutProps {
  currentUser: HeaderUser;
  title: string;
  language: Language;
  children: React.ReactNode;
}

export function AdminLayout({ currentUser, title, language, children }: AdminLayoutProps) {
  const router = useRouter();
  const t = getDictionary(language);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-base text-text">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(59,130,246,0.2),transparent_30%),radial-gradient(circle_at_86%_14%,rgba(245,158,11,0.14),transparent_26%),radial-gradient(circle_at_50%_96%,rgba(34,197,94,0.1),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="glass-panel flex flex-col gap-4 rounded-3xl px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-blue">{t.adminConsole}</p>
            <h1 className="mt-1 text-3xl font-black tracking-normal">{title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link className="glass-button rounded-full px-4 py-2.5 text-sm font-bold" href="/admin">
              {t.adminOverview}
            </Link>
            <Link className="glass-button rounded-full px-4 py-2.5 text-sm font-bold" href="/admin/users">
              {t.users}
            </Link>
            <Link className="glass-button rounded-full px-4 py-2.5 text-sm font-bold" href="/admin/signals">
              {t.signals}
            </Link>
            <LanguageSwitcher language={language} />
            <div className="rounded-2xl border border-white/12 bg-white/[0.055] px-3 py-2 text-sm">
              <p className="font-black">{currentUser.name || currentUser.email}</p>
              <p className="text-xs text-muted">Admin</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/12 bg-white/10 px-4 py-2.5 text-sm font-black text-muted transition hover:text-text"
            >
              {t.logout}
            </button>
          </div>
        </header>

        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
