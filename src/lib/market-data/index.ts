import { getMockPrices } from "./mock-provider";
import type { MarketPrice } from "./types";

export async function getPrices(pairs: string[]): Promise<Record<string, MarketPrice>> {
  const uniquePairs = Array.from(new Set(pairs.map((pair) => pair.trim()).filter(Boolean)));

  if (uniquePairs.length === 0) {
    return {};
  }

  return getMockPrices(uniquePairs);
}

export type { MarketPrice };
