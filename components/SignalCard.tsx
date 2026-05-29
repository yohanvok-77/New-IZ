import type { Signal } from "@/types/signal";
import { getSignalStatusColor, getSignalStatusLabel } from "@/lib/signalLifecycle";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

interface SignalCardProps {
  signal: Signal;
  selected: boolean;
  index: number;
  onSelect: (signal: Signal) => void;
  language: Language;
}

const directionStyles = {
  BUY: "border-success/30 bg-success/15 text-success",
  SELL: "border-danger/30 bg-danger/15 text-danger",
};

export function SignalCard({ signal, selected, index, onSelect, language }: SignalCardProps) {
  const t = getDictionary(language);

  return (
    <button
      type="button"
      onClick={() => onSelect(signal)}
      className={[
        "glass-panel group relative min-h-[226px] overflow-hidden rounded-3xl p-5 text-left",
        "animate-floatIn transition duration-300 hover:-translate-y-2 hover:scale-[1.015] hover:border-white/25 hover:shadow-glow",
        selected ? "border-blue/70 shadow-glow" : "",
      ].join(" ")}
      style={{ animationDelay: `${index * 55}ms` }}
      aria-pressed={selected}
    >
      <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <span className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue/15 blur-3xl transition duration-300 group-hover:bg-blue/25" />

      <span className="relative flex items-start justify-between gap-4">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-muted">{t.pair}</span>
          <span className="mt-2 block break-words text-2xl font-black tracking-normal text-text">
            {signal.pair}
          </span>
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-black ${getSignalStatusColor(
            signal.status,
          )}`}
        >
          {getSignalStatusLabel(signal.status, language)}
        </span>
      </span>

      <span className="relative mt-8 flex items-end justify-between gap-4">
        <span>
          <span className="block text-sm font-semibold text-muted">Winrate</span>
          <span className="mt-2 block text-5xl font-black tracking-normal text-text">
            {signal.winrate}%
          </span>
        </span>
        <span className={`rounded-full border px-3 py-1.5 text-sm font-black ${directionStyles[signal.direction]}`}>
          {signal.direction}
        </span>
      </span>

      <span className="relative mt-6 block h-1.5 overflow-hidden rounded-full bg-white/10">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-blue via-success to-gold"
          style={{ width: `${signal.winrate}%` }}
        />
      </span>

      <span className="relative mt-5 block text-sm font-semibold text-muted">{signal.publishedAt}</span>
    </button>
  );
}
