import type { Signal } from "@/types/signal";
import { calculateWinrate, isSignalActual } from "@/lib/signalLifecycle";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

interface StatsCardsProps {
  signals: Signal[];
  language?: Language;
}

export function StatsCards({ signals, language = "ru" }: StatsCardsProps) {
  const t = getDictionary(language);
  const active = signals.filter((signal) => isSignalActual(signal)).length;
  const averageWinrate = calculateWinrate(signals);
  const closedProfit = signals.filter((signal) => signal.status === "closed_tp").length;
  const closedLoss = signals.filter((signal) => signal.status === "closed_sl").length;

  const stats = [
    {
      label: t.activeIdeas,
      value: active,
      accent: "text-blue",
      glow: "bg-blue/20",
      bar: "bg-blue",
    },
    {
      label: t.averageWinrate,
      value: `${averageWinrate}%`,
      accent: "text-success",
      glow: "bg-success/20",
      bar: "bg-success",
    },
    {
      label: t.closedProfit,
      value: closedProfit,
      accent: "text-gold",
      glow: "bg-gold/20",
      bar: "bg-gold",
    },
    {
      label: t.closedLoss,
      value: closedLoss,
      accent: "text-danger",
      glow: "bg-danger/20",
      bar: "bg-danger",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={t.navStats}>
      {stats.map((item, index) => (
        <article
          key={item.label}
          className="glass-panel relative isolate animate-floatIn overflow-hidden rounded-3xl p-5"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <span className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${item.glow} blur-3xl`} />
          <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <p className="text-sm font-semibold text-muted">{item.label}</p>
          <strong className={`mt-4 block text-4xl font-black tracking-normal ${item.accent}`}>
            {item.value}
          </strong>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${item.bar}`}
              style={{ width: `${index === 3 ? 28 : 72 + index * 6}%` }}
            />
          </div>
        </article>
      ))}
    </section>
  );
}
