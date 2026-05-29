import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ForbiddenAdmin } from "@/components/admin/ForbiddenAdmin";
import { AdminSignalsPanel, type AdminSignalRow } from "@/components/admin/signals/AdminSignalsPanel";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getDictionary } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18nServer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function decimalToString(value: unknown) {
  return value?.toString() ?? null;
}

export default async function AdminSignalsPage() {
  const language = getCurrentLanguage();
  const t = getDictionary(language);
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    return <ForbiddenAdmin language={language} />;
  }

  const signals = await prisma.signal.findMany({
    orderBy: { publishedAt: "desc" },
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });

  const serializedSignals: AdminSignalRow[] = signals.map((signal) => ({
    id: signal.id,
    pair: signal.pair,
    direction: signal.direction,
    winrate: signal.winrate,
    entry: signal.entry.toString(),
    stopLoss: signal.stopLoss.toString(),
    takeProfit: signal.takeProfit.toString(),
    status: signal.status,
    publishedAt: signal.publishedAt.toISOString(),
    expiresAt: signal.expiresAt.toISOString(),
    lastMarketPrice: decimalToString(signal.lastMarketPrice),
    lastBid: decimalToString(signal.lastBid),
    lastAsk: decimalToString(signal.lastAsk),
    lastCheckedAt: signal.lastCheckedAt?.toISOString() || null,
    activatedAt: signal.activatedAt?.toISOString() || null,
    closedAt: signal.closedAt?.toISOString() || null,
    closeReason: signal.closeReason,
    events: signal.events.map((event) => ({
      id: event.id,
      type: event.type,
      price: decimalToString(event.price),
      bid: decimalToString(event.bid),
      ask: decimalToString(event.ask),
      message: event.message,
      createdAt: event.createdAt.toISOString(),
    })),
  }));

  return (
    <AdminLayout
      title={t.signals}
      language={language}
      currentUser={{
        name: user.name,
        email: user.email,
        role: user.role,
        accessUntil: user.accessUntil?.toISOString() || null,
      }}
    >
      <AdminSignalsPanel signals={serializedSignals} language={language} />
    </AdminLayout>
  );
}
