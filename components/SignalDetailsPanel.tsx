import { SignalScenarioChart } from "@/components/SignalScenarioChart";
import { getSignalStatusColor, getSignalStatusLabel } from "@/lib/signalLifecycle";
import type { Signal } from "@/types/signal";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

interface SignalDetailsPanelProps {
  signal: Signal | null;
  onClose: () => void;
  language: Language;
}

const directionStyles = {
  BUY: "border-success/30 bg-success/15 text-success",
  SELL: "border-danger/30 bg-danger/15 text-danger",
};

export function SignalDetailsPanel({ signal, onClose, language }: SignalDetailsPanelProps) {
  const t = getDictionary(language);

  if (!signal) {
    return null;
  }

  const details = [
    ["Entry price", signal.entry],
    ["Stop Loss", signal.stopLoss],
    ["Take Profit", signal.takeProfit],
    [t.publication, signal.publishedAt],
  ];

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/62"
        aria-label={t.closeDetails}
        onClick={onClose}
      />

      <aside className="glass-panel fixed inset-x-3 bottom-3 max-h-[92vh] overflow-y-auto rounded-[2rem] p-5 shadow-glass animate-sheetUp md:inset-x-auto md:bottom-6 md:right-6 md:top-6 md:w-[460px] md:animate-sheetIn md:p-6">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue/18 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-normal text-muted">{t.detailsTitle}</p>
            <h2 className="mt-2 break-words text-4xl font-black tracking-normal text-text">
              {signal.pair}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/12 bg-white/10 text-2xl text-text shadow-glow transition hover:scale-105 hover:bg-white/15"
            aria-label={t.close}
          >
            ×
          </button>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/12 bg-white/[0.055] p-5">
          <div className="pointer-events-none absolute -right-12 top-4 h-32 w-32 rounded-full bg-gold/12 blur-3xl" />
          <div className="relative flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1.5 text-sm font-black ${directionStyles[signal.direction]}`}
            >
              {signal.direction}
            </span>
            <span
              className={`rounded-full border px-3 py-1.5 text-sm font-black ${getSignalStatusColor(
                signal.status,
              )}`}
            >
              {getSignalStatusLabel(signal.status, language)}
            </span>
          </div>

          <div className="relative mt-7">
            <p className="text-sm font-semibold text-muted">Winrate</p>
            <strong className="mt-2 block text-6xl font-black leading-none tracking-normal text-text">
              {signal.winrate}%
            </strong>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue via-success to-gold"
                style={{ width: `${signal.winrate}%` }}
              />
            </div>
          </div>
        </div>

        <dl className="mt-5 grid gap-3">
          {details.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 backdrop-blur-xl transition hover:border-white/16 hover:bg-white/[0.065]"
            >
              <dt className="text-sm font-semibold text-muted">{label}</dt>
              <dd className="min-w-0 break-words text-right text-base font-black text-text">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <SignalScenarioChart signal={signal} language={language} />
      </aside>
    </div>
  );
}
