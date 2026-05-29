"use client";

import type { SignalDirection, SignalEventType, SignalStatus } from "@prisma/client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Language } from "@/lib/i18n";

type AdminSignalEvent = {
  id: string;
  type: SignalEventType;
  price: string | null;
  bid: string | null;
  ask: string | null;
  message: string | null;
  createdAt: string;
};

export type AdminSignalRow = {
  id: string;
  pair: string;
  direction: SignalDirection;
  winrate: number;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  status: SignalStatus;
  publishedAt: string;
  expiresAt: string;
  lastMarketPrice: string | null;
  lastBid: string | null;
  lastAsk: string | null;
  lastCheckedAt: string | null;
  activatedAt: string | null;
  closedAt: string | null;
  closeReason: string | null;
  events: AdminSignalEvent[];
};

type SignalFilter = "all" | "open" | "closed" | "inactive";

const text = {
  ru: {
    search: "Поиск по паре",
    all: "Все",
    open: "В работе",
    closed: "Закрытые",
    inactive: "Неактуальные",
    empty: "Сигналы пока не найдены.",
    marketSnapshot: "Рынок",
    lifecycle: "Жизненный цикл",
    events: "История событий",
    manualActions: "Ручные действия",
    entry: "Entry",
    stopLoss: "Stop Loss",
    takeProfit: "Take Profit",
    published: "Публикация",
    expires: "Истекает",
    lastMarketPrice: "Last price",
    lastBid: "Bid",
    lastAsk: "Ask",
    lastCheckedAt: "Проверено",
    activatedAt: "Активирован",
    closedAt: "Закрыт",
    closeReason: "Причина",
    closeTp: "Закрыть TP",
    closeSl: "Закрыть SL",
    cancel: "Отменить",
    pending: "Вернуть Pending",
    active: "Сделать Active",
    actionFailed: "Не удалось обновить сигнал.",
    noEvents: "Событий пока нет.",
  },
  en: {
    search: "Search by pair",
    all: "All",
    open: "Open",
    closed: "Closed",
    inactive: "Inactive",
    empty: "No signals found yet.",
    marketSnapshot: "Market",
    lifecycle: "Lifecycle",
    events: "Event history",
    manualActions: "Manual actions",
    entry: "Entry",
    stopLoss: "Stop Loss",
    takeProfit: "Take Profit",
    published: "Published",
    expires: "Expires",
    lastMarketPrice: "Last price",
    lastBid: "Bid",
    lastAsk: "Ask",
    lastCheckedAt: "Checked",
    activatedAt: "Activated",
    closedAt: "Closed",
    closeReason: "Reason",
    closeTp: "Close TP",
    closeSl: "Close SL",
    cancel: "Cancel",
    pending: "Return Pending",
    active: "Make Active",
    actionFailed: "Could not update signal.",
    noEvents: "No events yet.",
  },
} as const;

const statusLabels: Record<Language, Record<SignalStatus, string>> = {
  ru: {
    PENDING: "Ожидает вход",
    ACTIVE: "В работе",
    CLOSED_TP: "Закрыт TP",
    CLOSED_SL: "Закрыт SL",
    EXPIRED: "Не актуален",
    CANCELLED: "Отменён",
  },
  en: {
    PENDING: "Waiting entry",
    ACTIVE: "In progress",
    CLOSED_TP: "Closed TP",
    CLOSED_SL: "Closed SL",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
  },
};

const statusStyles: Record<SignalStatus, string> = {
  PENDING: "border-gold/35 bg-gold/15 text-gold",
  ACTIVE: "border-blue/35 bg-blue/15 text-blue",
  CLOSED_TP: "border-success/35 bg-success/15 text-success",
  CLOSED_SL: "border-danger/35 bg-danger/15 text-danger",
  EXPIRED: "border-white/15 bg-white/10 text-muted",
  CANCELLED: "border-danger/25 bg-danger/10 text-danger",
};

const eventStyles: Record<SignalEventType, string> = {
  CREATED: "bg-white/10 text-text",
  PRICE_CHECK: "bg-blue/10 text-blue",
  ENTRY_HIT: "bg-blue/10 text-blue",
  TP_HIT: "bg-success/10 text-success",
  SL_HIT: "bg-danger/10 text-danger",
  EXPIRED: "bg-gold/10 text-gold",
  CANCELLED: "bg-danger/10 text-danger",
  MANUAL_UPDATE: "bg-white/10 text-muted",
};

function formatDateTime(value: string | null, language: Language) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function DetailRow({ label, value, accent }: { label: string; value: string | null; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3">
      <span className="text-sm text-muted">{label}</span>
      <span className={["text-right text-sm font-black", accent || "text-text"].join(" ")}>{value || "—"}</span>
    </div>
  );
}

function ActionButton({
  label,
  action,
  signalId,
}: {
  label: string;
  action: string;
  signalId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const response = await fetch(`/api/admin/signals/${signalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("ACTION_FAILED");
      }

      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-full border border-white/12 bg-white/[0.07] px-3 py-2 text-xs font-black text-muted transition hover:border-blue/40 hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "..." : label}
    </button>
  );
}

export function AdminSignalsPanel({ signals, language }: { signals: AdminSignalRow[]; language: Language }) {
  const t = text[language];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SignalFilter>("all");
  const filters: Array<{ value: SignalFilter; label: string }> = [
    { value: "all", label: t.all },
    { value: "open", label: t.open },
    { value: "closed", label: t.closed },
    { value: "inactive", label: t.inactive },
  ];

  const filteredSignals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return signals.filter((signal) => {
      const matchesQuery = !normalizedQuery || signal.pair.toLowerCase().includes(normalizedQuery);
      const matchesFilter =
        filter === "all" ||
        (filter === "open" && ["PENDING", "ACTIVE"].includes(signal.status)) ||
        (filter === "closed" && ["CLOSED_TP", "CLOSED_SL"].includes(signal.status)) ||
        (filter === "inactive" && ["EXPIRED", "CANCELLED"].includes(signal.status));

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, signals]);

  return (
    <section className="grid gap-4">
      <div className="glass-panel rounded-3xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search}
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

      {filteredSignals.map((signal) => (
        <article key={signal.id} className="glass-panel rounded-3xl p-5">
          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-black",
                    signal.direction === "BUY"
                      ? "border-success/35 bg-success/15 text-success"
                      : "border-danger/35 bg-danger/15 text-danger",
                  ].join(" ")}
                >
                  {signal.direction}
                </span>
                <span className={["rounded-full border px-3 py-1 text-xs font-black", statusStyles[signal.status]].join(" ")}>
                  {statusLabels[language][signal.status]}
                </span>
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-normal">{signal.pair}</h2>
              <p className="mt-1 text-sm font-semibold text-muted">Winrate {signal.winrate}%</p>

              <div className="mt-5 grid gap-2">
                <DetailRow label={t.entry} value={signal.entry} accent="text-blue" />
                <DetailRow label={t.stopLoss} value={signal.stopLoss} accent="text-danger" />
                <DetailRow label={t.takeProfit} value={signal.takeProfit} accent="text-success" />
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-normal text-muted">{t.marketSnapshot}</p>
              <div className="grid gap-2">
                <DetailRow label={t.lastMarketPrice} value={signal.lastMarketPrice} />
                <DetailRow label={t.lastBid} value={signal.lastBid} accent="text-blue" />
                <DetailRow label={t.lastAsk} value={signal.lastAsk} accent="text-gold" />
                <DetailRow label={t.lastCheckedAt} value={formatDateTime(signal.lastCheckedAt, language)} />
              </div>

              <p className="mb-3 mt-5 text-xs font-black uppercase tracking-normal text-muted">{t.lifecycle}</p>
              <div className="grid gap-2">
                <DetailRow label={t.published} value={formatDateTime(signal.publishedAt, language)} />
                <DetailRow label={t.expires} value={formatDateTime(signal.expiresAt, language)} />
                <DetailRow label={t.activatedAt} value={formatDateTime(signal.activatedAt, language)} />
                <DetailRow label={t.closedAt} value={formatDateTime(signal.closedAt, language)} />
                <DetailRow label={t.closeReason} value={signal.closeReason} />
              </div>
            </div>

            <div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-xs font-black uppercase tracking-normal text-muted">{t.manualActions}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ActionButton signalId={signal.id} action="close_tp" label={t.closeTp} />
                  <ActionButton signalId={signal.id} action="close_sl" label={t.closeSl} />
                  <ActionButton signalId={signal.id} action="cancel" label={t.cancel} />
                  <ActionButton signalId={signal.id} action="pending" label={t.pending} />
                  <ActionButton signalId={signal.id} action="active" label={t.active} />
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-xs font-black uppercase tracking-normal text-muted">{t.events}</p>
                <div className="mt-4 grid max-h-72 gap-3 overflow-y-auto pr-1">
                  {signal.events.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-white/10 bg-[#080B12]/55 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={["rounded-full px-2.5 py-1 text-[11px] font-black", eventStyles[event.type]].join(" ")}>
                          {event.type}
                        </span>
                        <span className="text-xs text-muted">{formatDateTime(event.createdAt, language)}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-text">{event.message || "—"}</p>
                      <p className="mt-2 text-xs text-muted">
                        Price {event.price || "—"} · Bid {event.bid || "—"} · Ask {event.ask || "—"}
                      </p>
                    </div>
                  ))}
                  {signal.events.length === 0 ? <p className="text-sm text-muted">{t.noEvents}</p> : null}
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}

      {filteredSignals.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 text-center text-muted">{t.empty}</div>
      ) : null}
    </section>
  );
}
