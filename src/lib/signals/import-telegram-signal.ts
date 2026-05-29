import { prisma } from "../../../lib/prisma";
import {
  parseTelegramSignalMessage,
  toSignalCreateInput,
} from "./telegram-signal-parser";

export type ImportTelegramSignalOptions = {
  text: string;
  winrate?: number;
  expiresInHours?: number;
  publishedAt?: Date;
};

export async function importTelegramSignal(options: ImportTelegramSignalOptions) {
  const parsed = parseTelegramSignalMessage(options.text, {
    expiresInHours: options.expiresInHours,
    publishedAt: options.publishedAt,
  });

  const signal = await prisma.signal.create({
    data: toSignalCreateInput(parsed, { winrate: options.winrate }),
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return {
    signal,
    parsed,
  };
}

export function serializeImportedSignal(result: Awaited<ReturnType<typeof importTelegramSignal>>) {
  return {
    signal: {
      id: result.signal.id,
      pair: result.signal.pair,
      direction: result.signal.direction,
      entry: result.signal.entry.toString(),
      stopLoss: result.signal.stopLoss.toString(),
      takeProfit: result.signal.takeProfit.toString(),
      winrate: result.signal.winrate,
      status: result.signal.status,
    },
    parsed: {
      algorithm: result.parsed.algorithm,
      openedPositions: result.parsed.openedPositions,
      gridOrders: result.parsed.gridOrders,
      stepPoints: result.parsed.stepPoints,
      stopLossPoints: result.parsed.stopLossPoints,
      calculatedWinrate: result.parsed.winrate,
      sourceUrl: result.parsed.sourceUrl,
    },
  };
}
