"use client";

import { useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { Header, type HeaderUser } from "@/components/Header";
import { SignalCard } from "@/components/SignalCard";
import { SignalDetailsPanel } from "@/components/SignalDetailsPanel";
import { StatsCards } from "@/components/StatsCards";
import { mockSignals } from "@/data/mockSignals";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { isSignalActual, isSignalClosed } from "@/lib/signalLifecycle";
import type { Signal, SignalFilter } from "@/types/signal";

interface DashboardProps {
  currentUser: HeaderUser;
  language: Language;
}

export function Dashboard({ currentUser, language }: DashboardProps) {
  const t = getDictionary(language);
  const [activeFilter, setActiveFilter] = useState<SignalFilter>("all");
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  const filteredSignals = useMemo(() => {
    if (activeFilter === "all") {
      return mockSignals;
    }

    if (activeFilter === "actual") {
      return mockSignals.filter((signal) => isSignalActual(signal));
    }

    if (activeFilter === "closed") {
      return mockSignals.filter((signal) => isSignalClosed(signal));
    }

    if (activeFilter === "inactive") {
      return mockSignals.filter(
        (signal) => signal.status === "expired" || signal.status === "cancelled",
      );
    }

    return mockSignals.filter((signal) => signal.direction === activeFilter);
  }, [activeFilter]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-base">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(59,130,246,0.2),transparent_28%),radial-gradient(circle_at_86%_16%,rgba(245,158,11,0.14),transparent_24%),radial-gradient(circle_at_50%_96%,rgba(34,197,94,0.14),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
        <div className="absolute left-1/2 top-0 h-64 w-[52rem] -translate-x-1/2 rounded-full bg-blue/10 blur-3xl" />
      </div>

      <div className="relative z-10 py-4 sm:py-6">
        <Header currentUser={currentUser} language={language} />

        <section className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
          <StatsCards signals={mockSignals} language={language} />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-sm font-bold text-blue backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_16px_rgba(34,197,94,0.8)]" />
                Live dashboard
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-normal text-text sm:text-4xl">
                {t.dashboardMap}
              </h2>
            </div>
            <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} language={language} />
          </div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredSignals.map((signal, index) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                index={index}
                selected={selectedSignal?.id === signal.id}
                onSelect={setSelectedSignal}
                language={language}
              />
            ))}
          </section>

          <p className="pb-10 pt-4 text-center text-sm leading-6 text-muted">
            {t.disclaimer}
          </p>
        </section>
      </div>

      <SignalDetailsPanel signal={selectedSignal} onClose={() => setSelectedSignal(null)} language={language} />
    </main>
  );
}
