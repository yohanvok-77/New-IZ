import { NextResponse } from "next/server";
import type { Prisma, SignalEventType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface RouteContext {
  params: {
    signalId: string;
  };
}

function getManualUpdate(signal: Awaited<ReturnType<typeof prisma.signal.findUnique>>, action: string) {
  if (!signal) {
    return null;
  }

  const now = new Date();

  if (action === "close_tp") {
    return {
      eventType: "TP_HIT" as SignalEventType,
      message: "Signal was manually closed by Take Profit.",
      price: signal.takeProfit,
      data: {
        status: "CLOSED_TP",
        closedAt: now,
        closePrice: signal.takeProfit,
        closeReason: "manual_take_profit",
      } satisfies Prisma.SignalUpdateInput,
    };
  }

  if (action === "close_sl") {
    return {
      eventType: "SL_HIT" as SignalEventType,
      message: "Signal was manually closed by Stop Loss.",
      price: signal.stopLoss,
      data: {
        status: "CLOSED_SL",
        closedAt: now,
        closePrice: signal.stopLoss,
        closeReason: "manual_stop_loss",
      } satisfies Prisma.SignalUpdateInput,
    };
  }

  if (action === "cancel") {
    return {
      eventType: "CANCELLED" as SignalEventType,
      message: "Signal was cancelled manually.",
      price: signal.lastMarketPrice,
      data: {
        status: "CANCELLED",
        closedAt: now,
        closeReason: "manual_cancelled",
      } satisfies Prisma.SignalUpdateInput,
    };
  }

  if (action === "pending") {
    return {
      eventType: "MANUAL_UPDATE" as SignalEventType,
      message: "Signal was returned to Pending manually.",
      price: signal.lastMarketPrice,
      data: {
        status: "PENDING",
        activatedAt: null,
        closedAt: null,
        entryHitPrice: null,
        closePrice: null,
        closeReason: null,
      } satisfies Prisma.SignalUpdateInput,
    };
  }

  if (action === "active") {
    return {
      eventType: "MANUAL_UPDATE" as SignalEventType,
      message: "Signal was moved to Active manually.",
      price: signal.entry,
      data: {
        status: "ACTIVE",
        activatedAt: signal.activatedAt ?? now,
        entryHitPrice: signal.entryHitPrice ?? signal.entry,
        closedAt: null,
        closePrice: null,
        closeReason: null,
      } satisfies Prisma.SignalUpdateInput,
    };
  }

  return null;
}

export async function POST(request: Request, context: RouteContext) {
  const admin = await getCurrentUser();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ message: "Not enough permissions." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";
    const signal = await prisma.signal.findUnique({
      where: { id: context.params.signalId },
    });
    const update = getManualUpdate(signal, action);

    if (!signal || !update) {
      return NextResponse.json({ message: "Signal or action not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.signal.update({
        where: { id: signal.id },
        data: update.data,
      });

      await tx.signalEvent.create({
        data: {
          signalId: signal.id,
          type: update.eventType,
          price: update.price,
          bid: signal.lastBid,
          ask: signal.lastAsk,
          message: update.message,
        },
      });
    });

    return NextResponse.json({ message: "Signal updated." });
  } catch (error) {
    console.error("[admin-signals] manual action failed", error);
    return NextResponse.json({ message: "Could not update signal." }, { status: 500 });
  }
}
