export type SignalDirection = "BUY" | "SELL";

export type SignalStatus =
  | "pending"
  | "active"
  | "closed_tp"
  | "closed_sl"
  | "expired"
  | "cancelled";

export type SignalCloseReason = "take_profit" | "stop_loss" | "expired" | "cancelled" | null;

export interface Signal {
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
  activatedAt: string | null;
  closedAt: string | null;
  closeReason: SignalCloseReason;
  closePrice: string | null;
  lastPrice: string | null;
}

export type SignalFilter = "all" | "actual" | "closed" | "inactive" | SignalDirection;
