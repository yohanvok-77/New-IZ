import { prisma } from "../../lib/prisma";
import { getPrices } from "../lib/market-data";
import { processSignalWithPrice } from "../lib/signals/process-signal-with-price";

const intervalMs = 10_000;
let isRunning = false;

async function runMarketCheck() {
  if (isRunning) {
    console.log("[market-watcher] previous cycle is still running, skipping.");
    return;
  }

  isRunning = true;
  const startedAt = Date.now();

  try {
    const signals = await prisma.signal.findMany({
      where: {
        status: {
          in: ["PENDING", "ACTIVE"],
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    if (signals.length === 0) {
      console.log("[market-watcher] no pending or active signals.");
      return;
    }

    const pairs = Array.from(new Set(signals.map((signal) => signal.pair)));
    const prices = await getPrices(pairs);
    let changedCount = 0;
    let skippedCount = 0;

    for (const signal of signals) {
      const price = prices[signal.pair];

      if (!price) {
        skippedCount += 1;
        console.warn(`[market-watcher] missing market price for ${signal.pair}.`);
        continue;
      }

      try {
        const result = await processSignalWithPrice(signal, price);

        if (result.changed) {
          changedCount += 1;
          console.log(
            `[market-watcher] ${signal.pair} ${signal.id}: ${signal.status} -> ${result.status} (${result.eventType}).`,
          );
        }
      } catch (error) {
        skippedCount += 1;
        console.error(`[market-watcher] failed to process signal ${signal.id}.`, error);
      }
    }

    console.log(
      `[market-watcher] checked=${signals.length} changed=${changedCount} skipped=${skippedCount} pairs=${pairs.length} duration=${Date.now() - startedAt}ms`,
    );
  } catch (error) {
    console.error("[market-watcher] cycle failed.", error);
  } finally {
    isRunning = false;
  }
}

async function shutdown() {
  console.log("[market-watcher] stopping.");
  await prisma.$disconnect();
  process.exit(0);
}

console.log(`[market-watcher] started. Interval: ${intervalMs / 1000}s.`);
void runMarketCheck();
const timer = setInterval(() => void runMarketCheck(), intervalMs);

process.on("SIGINT", () => {
  clearInterval(timer);
  void shutdown();
});

process.on("SIGTERM", () => {
  clearInterval(timer);
  void shutdown();
});
