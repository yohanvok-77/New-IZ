import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getDictionary } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18nServer";

export default function LandingPage() {
  const language = getCurrentLanguage();
  const t = getDictionary(language);
  const productStats = [
    ["24/7", t.marketMonitoring],
    ["6", t.ideaStatuses],
    ["1", t.closedPlatform],
  ];
  const features = [
    { title: t.featureReadableTitle, text: t.featureReadableText },
    { title: t.featureAccessTitle, text: t.featureAccessText },
    { title: t.featureLifecycleTitle, text: t.featureLifecycleText },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-base text-text">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(245,158,11,0.16),transparent_28%),radial-gradient(circle_at_52%_96%,rgba(34,197,94,0.13),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
      </div>

      <header className="fixed inset-x-0 top-0 z-30 px-4 py-4 sm:px-6 lg:px-8">
        <nav className="glass-panel mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-3xl px-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-lg font-black text-blue shadow-glow">
              {t.logo}
            </span>
            <span className="truncate text-lg font-black tracking-normal">{t.brand}</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher language={language} />
            <Link href="/login" className="glass-button rounded-full px-4 py-2.5 text-sm font-black">
              {t.login}
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-blue px-4 py-2.5 text-sm font-black text-white shadow-glow transition hover:scale-[1.02]"
            >
              {t.register}
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[92vh] w-full max-w-7xl flex-col justify-center px-4 pb-14 pt-32 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-sm font-bold text-blue backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_16px_rgba(34,197,94,0.8)]" />
            {t.premiumBadge}
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.96] tracking-normal sm:text-7xl lg:text-8xl">
            {t.landingTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-muted sm:text-xl">
            {t.landingText}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-2xl bg-blue px-6 py-4 text-center font-black text-white shadow-glow transition hover:scale-[1.01]"
            >
              {t.createAccount}
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/12 bg-white/10 px-6 py-4 text-center font-black text-text backdrop-blur-xl transition hover:bg-white/15"
            >
              {t.enterPlatform}
            </Link>
          </div>
        </div>

        <div className="pointer-events-none mt-12 grid gap-4 lg:absolute lg:bottom-12 lg:right-8 lg:mt-0 lg:w-[520px]">
          <div className="glass-panel rotate-0 rounded-[2rem] p-4 shadow-glass lg:rotate-[-2deg]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted">{t.liveIdea}</p>
                <h2 className="text-3xl font-black">GBP/USD</h2>
              </div>
              <span className="rounded-full border border-success/35 bg-success/15 px-3 py-1 text-xs font-black text-success">
                {t.closedTp}
              </span>
            </div>
            <div className="h-44 overflow-hidden rounded-3xl border border-white/10 bg-[#080B12]/80 p-4">
              <svg className="h-full w-full" viewBox="0 0 360 180" preserveAspectRatio="none">
                {[34, 70, 106, 142].map((y) => (
                  <line key={y} x1="0" x2="360" y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
                ))}
                <path
                  d="M8 142 C48 120 72 134 106 98 C142 58 172 86 210 52 C250 18 292 38 352 22"
                  fill="none"
                  stroke="#22C55E"
                  strokeLinecap="round"
                  strokeWidth="5"
                />
                <circle cx="132" cy="78" r="7" fill="#3B82F6" />
                <circle cx="300" cy="34" r="7" fill="#22C55E" />
                <circle cx="70" cy="132" r="7" fill="#EF4444" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10 bg-white/[0.025] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {productStats.map(([value, label]) => (
            <article key={label} className="glass-panel rounded-3xl p-5">
              <strong className="text-4xl font-black text-text">{value}</strong>
              <p className="mt-2 text-sm font-semibold text-muted">{label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-3xl text-3xl font-black tracking-normal sm:text-5xl">
            {t.landingSectionTitle}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="glass-panel rounded-3xl p-6">
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="mt-3 leading-7 text-muted">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
