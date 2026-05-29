"use client";

import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export function NoAccessScreen({ language }: { language: Language }) {
  const router = useRouter();
  const t = getDictionary(language);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-base px-4 py-8 text-text">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(59,130,246,0.2),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.14),transparent_28%)]" />
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center">
        <div className="glass-panel relative w-full rounded-[2rem] p-7 text-center sm:p-10">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-3xl border border-gold/25 bg-gold/10 text-2xl font-black text-gold">
            !
          </div>
          <div className="absolute right-5 top-5">
            <LanguageSwitcher language={language} />
          </div>
          <h1 className="text-4xl font-black tracking-normal">{t.noAccessTitle}</h1>
          <p className="mt-4 leading-7 text-muted">
            {t.noAccessText}
          </p>
          <p className="mt-3 rounded-2xl border border-white/12 bg-white/[0.045] p-4 text-sm text-muted">
            {t.noAccessHelp}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="rounded-2xl border border-blue/35 bg-blue/15 px-5 py-3 font-black text-blue transition hover:bg-blue/20"
            >
              {t.contactAdmin}
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl border border-white/12 bg-white/10 px-5 py-3 font-black text-text transition hover:bg-white/15"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
