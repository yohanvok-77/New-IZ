import type { Signal, SignalEventType, SignalStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import type { MarketPrice } from "../market-data/types";

type ProcessResult = {
  signalId: string;
  status: SignalStatus;
  changed: boolean;
  eventType?: SignalEventType;
  skipped?: boolean;
};

const terminalStatuses: SignalStatus[] = ["CLOSED_TP", "CLOSED_SL", "EXPIRED", "CANCELLED"];

function toNumber(value: unknown) {
  return Number(value?.toString());
}

function getMarketUpdateData(marketPrice: MarketPrice) {
  return {
    lastBid: marketPrice.bid,
    lastAsk: marketPrice.ask,
    lastMarketPrice: marketPrice.mid,
    lastCheckedAt: marketPrice.timestamp,
  };
}

function isEntryHit(signal: Signal, marketPrice: MarketPrice) {
  const entry = toNumber(signal.entry);

  return signal.direction === "BUY" ? marketPrice.ask >= entry : marketPrice.bid <= entry;
}

function isTakeProfitHit(signal: Signal, marketPrice: MarketPrice) {
  const takeProfit = toNumber(signal.takeProfit);

  return signal.direction === "BUY" ? marketPrice.bid >= takeProfit : marketPrice.ask <= takeProfit;
}

function isStopLossHit(signal: Signal, marketPrice: MarketPrice) {
  const stopLoss = toNumber(signal.stopLoss);

  return signal.direction === "BUY" ? marketPrice.bid <= stopLoss : marketPrice.ask >= stopLoss;
}

function getEntryHitPrice(signal: Signal, marketPrice: MarketPrice) {
  return signal.direction === "BUY" ? marketPrice.ask : marketPrice.bid;
}

function getClosePrice(signal: Signal, marketPrice: MarketPrice) {
  return signal.direction === "BUY" ? marketPrice.bid : marketPrice.ask;
}

async function updateMarketSnapshot(signal: Signal, marketPrice: MarketPrice): Promise<ProcessResult> {
  const updated = await prisma.signal.update({
    where: { id: signal.id },
    data: getMarketUpdateData(marketPrice),
  });

  return {
    signalId: updated.id,
    status: updated.status,
    changed: false,
  };
}

export async function processSignalWithPrice(
  signal: Signal,
  marketPrice: MarketPrice,
  now = new Date(),
): Promise<ProcessResult> {
  if (terminalStatuses.includes(signal.status)) {
    return {
      signalId: signal.id,
      status: signal.status,
      changed: false,
      skipped: true,
    };
  }

  const marketData = getMarketUpdateData(marketPrice);

  if (signal.status === "PENDING" && signal.expiresAt.getTime() < now.getTime()) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.signal.update({
        where: { id: signal.id },
        data: {
          ...marketData,
          status: "EXPIRED",
          closedAt: now,
          closeReason: "expired_before_entry",
        },
      });

      await tx.signalEvent.create({
        data: {
          signalId: signal.id,
          type: "EXPIRED",
          price: marketPrice.mid,
          bid: marketPrice.bid,
          ask: marketPrice.ask,
          message: "Signal expired before entry price was reached.",
        },
      });

      return {
        signalId: updated.id,
        status: updated.status,
        changed: true,
        eventType: "EXPIRED",
      };
    });
  }

  if (signal.status === "PENDING" && isEntryHit(signal, marketPrice)) {
    const entryHitPrice = getEntryHitPrice(signal, marketPrice);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.signal.update({
        where: { id: signal.id },
        data: {
          ...marketData,
          status: "ACTIVE",
          activatedAt: now,
          entryHitPrice,
          closePrice: null,
          closeReason: null,
          closedAt: null,
        },
      });

      await tx.signalEvent.create({
        data: {
          signalId: signal.id,
          type: "ENTRY_HIT",
          price: entryHitPrice,
          bid: marketPrice.bid,
          ask: marketPrice.ask,
          message: "Entry price reached. Signal moved to active status.",
        },
      });

      return {
        signalId: updated.id,
        status: updated.status,
        changed: true,
        eventType: "ENTRY_HIT",
      };
    });
  }

  if (signal.status === "ACTIVE" && isTakeProfitHit(signal, marketPrice)) {
    const closePrice = getClosePrice(signal, marketPrice);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.signal.update({
        where: { id: signal.id },
        data: {
          ...marketData,
          status: "CLOSED_TP",
          closedAt: now,
          closePrice,
          closeReason: "take_profit",
        },
      });

      await tx.signalEvent.create({
        data: {
          signalId: signal.id,
          type: "TP_HIT",
          price: closePrice,
          bid: marketPrice.bid,
          ask: marketPrice.ask,
          message: "Take Profit reached. Signal closed in profit.",
        },
      });

      return {
        signalId: updated.id,
        status: updated.status,
        changed: true,
        eventType: "TP_HIT",
      };
    });
  }

  if (signal.status === "ACTIVE" && isStopLossHit(signal, marketPrice)) {
    const closePrice = getClosePrice(signal, marketPrice);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.signal.update({
        where: { id: signal.id },
        data: {
          ...marketData,
          status: "CLOSED_SL",
          closedAt: now,
          closePrice,
          closeReason: "stop_loss",
        },
      });

      await tx.signalEvent.create({
        data: {
          signalId: signal.id,
          type: "SL_HIT",
          price: closePrice,
          bid: marketPrice.bid,
          ask: marketPrice.ask,
          message: "Stop Loss reached. Signal closed in loss.",
        },
      });

      return {
        signalId: updated.id,
        status: updated.status,
        changed: true,
        eventType: "SL_HIT",
      };
    });
  }

  return updateMarketSnapshot(signal, marketPrice);
}
