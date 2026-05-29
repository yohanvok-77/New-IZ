import type { Signal, SignalStatus } from "@/types/signal";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export function isSignalClosed(signal: Signal) {
  return signal.status === "closed_tp" || signal.status === "closed_sl";
}

export function isSignalActual(signal: Signal, now = new Date()) {
  const isOpen = signal.status === "pending" || signal.status === "active";
  return isOpen && now.getTime() <= new Date(signal.expiresAt).getTime();
}

export function getSignalStatusLabel(status: SignalStatus, language: Language = "ru") {
  const t = getDictionary(language);
  const labels: Record<SignalStatus, string> = {
    pending: t.statusPending,
    active: t.statusActive,
    closed_tp: t.statusClosedTp,
    closed_sl: t.statusClosedSl,
    expired: t.statusExpired,
    cancelled: t.statusCancelled,
  };

  return labels[status];
}

export function getSignalStatusColor(status: SignalStatus) {
  const colors: Record<SignalStatus, string> = {
    pending: "border-gold/35 bg-gold/15 text-gold",
    active: "border-blue/35 bg-blue/15 text-blue",
    closed_tp: "border-success/35 bg-success/15 text-success",
    closed_sl: "border-danger/35 bg-danger/15 text-danger",
    expired: "border-white/18 bg-white/10 text-muted",
    cancelled: "border-white/18 bg-white/10 text-muted",
  };

  return colors[status];
}

export function calculateWinrate(signals: Signal[]) {
  const closedSignals = signals.filter(isSignalClosed);

  if (closedSignals.length > 0) {
    const takeProfits = closedSignals.filter((signal) => signal.status === "closed_tp").length;
    return Math.round((takeProfits / closedSignals.length) * 100);
  }

  if (signals.length === 0) {
    return 0;
  }

  return Math.round(signals.reduce((sum, signal) => sum + signal.winrate, 0) / signals.length);
}

export function updateSignalByPrice(signal: Signal, currentPrice: number, now = new Date()): Signal {
  const lastPrice = formatPriceLikeSignal(signal.entry, currentPrice);
  const expiresAt = new Date(signal.expiresAt);

  if (!isSignalClosed(signal) && signal.status !== "cancelled" && now.getTime() > expiresAt.getTime()) {
    return {
      ...signal,
      status: "expired",
      closedAt: now.toISOString(),
      closeReason: "expired",
      closePrice: lastPrice,
      lastPrice,
    };
  }

  if (isSignalClosed(signal) || signal.status === "expired" || signal.status === "cancelled") {
    return { ...signal, lastPrice };
  }

  const takeProfit = parseSignalPrice(signal.takeProfit);
  const stopLoss = parseSignalPrice(signal.stopLoss);
  const hitTakeProfit =
    signal.direction === "BUY" ? currentPrice >= takeProfit : currentPrice <= takeProfit;
  const hitStopLoss =
    signal.direction === "BUY" ? currentPrice <= stopLoss : currentPrice >= stopLoss;

  if (hitTakeProfit) {
    return {
      ...signal,
      status: "closed_tp",
      closedAt: now.toISOString(),
      closeReason: "take_profit",
      closePrice: lastPrice,
      lastPrice,
    };
  }

  if (hitStopLoss) {
    return {
      ...signal,
      status: "closed_sl",
      closedAt: now.toISOString(),
      closeReason: "stop_loss",
      closePrice: lastPrice,
      lastPrice,
    };
  }

  return { ...signal, lastPrice };
}

function parseSignalPrice(value: string) {
  return Number(value.replace(/\s/g, "").replace(",", "."));
}

function formatPriceLikeSignal(reference: string, price: number) {
  const decimals = reference.includes(".") ? reference.split(".")[1].length : 0;
  const formatted = price.toFixed(decimals);
  return reference.includes(" ") ? formatted.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : formatted;
}
