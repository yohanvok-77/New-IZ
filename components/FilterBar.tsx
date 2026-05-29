import type { SignalFilter } from "@/types/signal";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

interface FilterBarProps {
  activeFilter: SignalFilter;
  onFilterChange: (filter: SignalFilter) => void;
  language: Language;
}

export function FilterBar({ activeFilter, onFilterChange, language }: FilterBarProps) {
  const t = getDictionary(language);
  const filters: Array<{ label: string; value: SignalFilter }> = [
    { label: t.all, value: "all" },
    { label: t.navActive, value: "actual" },
    { label: t.closed, value: "closed" },
    { label: t.inactive, value: "inactive" },
    { label: "BUY", value: "BUY" },
    { label: "SELL", value: "SELL" },
  ];

  return (
    <section className="glass-panel rounded-3xl p-2" aria-label={t.filters}>
      <div className="flex gap-2 overflow-x-auto">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onFilterChange(filter.value)}
              className={[
                "shrink-0 rounded-full px-4 py-2.5 text-sm font-black transition duration-200",
                isActive
                  ? "bg-blue text-white shadow-glow"
                  : "text-muted hover:bg-white/10 hover:text-text",
              ].join(" ")}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
