import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Language } from "@/lib/i18n";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  language: Language;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, language, children }: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-base px-4 py-8 text-text">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(245,158,11,0.14),transparent_26%),radial-gradient(circle_at_50%_94%,rgba(34,197,94,0.12),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <div className="glass-panel w-full rounded-[2rem] p-6 sm:p-8">
          <div className="mb-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-glow">
                <span className="text-xl font-black text-blue">{language === "en" ? "TI" : "ТИ"}</span>
              </div>
              <LanguageSwitcher language={language} />
            </div>
            <h1 className="text-3xl font-black tracking-normal">{title}</h1>
            <p className="mt-2 leading-6 text-muted">{subtitle}</p>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
