import type { MarketPrice } from "./types";

const basePrices: Record<string, number> = {
  "EUR/USD": 1.0842,
  "GBP/USD": 1.2675,
  "GBP/CHF": 1.0513,
  "XAU/USD": 2358.4,
  "BTC/USD": 67250,
  "ETH/USD": 3520,
  "USD/JPY": 156.2,
  "AUD/USD": 0.661,
  "USD/CHF": 0.913,
  "NASDAQ": 18480,
  "US30": 39240,
};

function getBasePrice(pair: string) {
  return basePrices[pair] ?? 1 + Math.random() * 2;
}

function getVolatility(base: number) {
  if (base > 10000) {
    return base * 0.003;
  }

  if (base > 100) {
    return base * 0.0015;
  }

  return base * 0.0008;
}

export async function getMockPrices(pairs: string[]): Promise<Record<string, MarketPrice>> {
  const timestamp = new Date();

  return pairs.reduce<Record<string, MarketPrice>>((prices, pair) => {
    const base = getBasePrice(pair);
    const volatility = getVolatility(base);
    const drift = (Math.random() - 0.5) * volatility;
    const mid = Number((base + drift).toFixed(base > 100 ? 2 : 5));
    const spread = Math.max(base * 0.00008, base > 100 ? 0.05 : 0.00008);
    const bid = Number((mid - spread / 2).toFixed(base > 100 ? 2 : 5));
    const ask = Number((mid + spread / 2).toFixed(base > 100 ? 2 : 5));

    prices[pair] = {
      pair,
      bid,
      ask,
      mid,
      timestamp,
    };

    return prices;
  }, {});
}
