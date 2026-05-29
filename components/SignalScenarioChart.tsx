import type { Signal } from "@/types/signal";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

interface SignalScenarioChartProps {
  signal: Signal;
  language: Language;
}

interface ChartPoint {
  label: "Entry" | "TP" | "SL";
  value: string;
  x: number;
  y: number;
  color: string;
}

export function SignalScenarioChart({ signal, language }: SignalScenarioChartProps) {
  const t = getDictionary(language);
  const isBuy = signal.direction === "BUY";
  const path = isBuy
    ? "M20 136 C52 116 70 129 96 105 C125 78 149 101 178 70 C205 41 229 58 264 34"
    : "M20 50 C52 72 72 58 98 86 C126 116 150 92 180 126 C207 154 232 132 264 160";

  const fillPath = isBuy
    ? `${path} L264 178 L20 178 Z`
    : `${path} L264 20 L20 20 Z`;

  const points: ChartPoint[] = isBuy
    ? [
        { label: "TP", value: signal.takeProfit, x: 236, y: 48, color: "#22C55E" },
        { label: "Entry", value: signal.entry, x: 142, y: 98, color: "#3B82F6" },
        { label: "SL", value: signal.stopLoss, x: 78, y: 142, color: "#EF4444" },
      ]
    : [
        { label: "SL", value: signal.stopLoss, x: 76, y: 52, color: "#EF4444" },
        { label: "Entry", value: signal.entry, x: 142, y: 98, color: "#3B82F6" },
        { label: "TP", value: signal.takeProfit, x: 236, y: 146, color: "#22C55E" },
      ];

  return (
    <section className="mt-5 rounded-3xl border border-white/12 bg-white/[0.045] p-4 shadow-gold">
      <div>
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-text">
            {t.scenarioTitle}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted">
            {t.scenarioSubtitle}
          </p>
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-3xl border border-white/10 bg-[#080B12]/80">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.2),transparent_34%),radial-gradient(circle_at_18%_78%,rgba(245,158,11,0.14),transparent_34%)]" />
        <svg
          className="relative z-10 h-60 w-full sm:h-64"
          viewBox="0 0 320 190"
          role="img"
          aria-label={`${t.scenarioAria} ${signal.pair}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`priceLine-${signal.id}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.85" />
              <stop offset="52%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="100%" stopColor={isBuy ? "#22C55E" : "#EF4444"} stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id={`priceFill-${signal.id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={isBuy ? "#22C55E" : "#EF4444"} stopOpacity="0.22" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
            <filter id={`softGlow-${signal.id}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[34, 70, 106, 142, 178].map((y) => (
            <line
              key={y}
              x1="16"
              x2="304"
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.09)"
              strokeWidth="1"
            />
          ))}
          {[64, 128, 192, 256].map((x) => (
            <line
              key={x}
              x1={x}
              x2={x}
              y1="18"
              y2="178"
              stroke="rgba(255,255,255,0.045)"
              strokeWidth="1"
            />
          ))}

          <path d={fillPath} fill={`url(#priceFill-${signal.id})`} opacity="0.9" />
          <path
            d={path}
            fill="none"
            stroke={`url(#priceLine-${signal.id})`}
            strokeLinecap="round"
            strokeWidth="4"
            filter={`url(#softGlow-${signal.id})`}
          />

          {points.map((point) => (
            <g key={point.label}>
              <line
                x1="20"
                x2="300"
                y1={point.y}
                y2={point.y}
                stroke={point.color}
                strokeDasharray="5 7"
                strokeOpacity="0.46"
                strokeWidth="1.2"
              />
              <circle cx={point.x} cy={point.y} r="8" fill="#080B12" stroke={point.color} strokeWidth="3" />
              <circle cx={point.x} cy={point.y} r="3.5" fill={point.color} />
              <g transform={`translate(${Math.min(point.x + 12, 246)} ${point.y - 15})`}>
                <rect
                  width="58"
                  height="26"
                  rx="13"
                  fill="rgba(8,11,18,0.84)"
                  stroke={point.color}
                  strokeOpacity="0.42"
                />
                <text
                  x="29"
                  y="17"
                  textAnchor="middle"
                  fill={point.color}
                  fontSize="10"
                  fontWeight="800"
                >
                  {point.label}
                </text>
              </g>
            </g>
          ))}
        </svg>

        <div className="grid grid-cols-3 gap-2 border-t border-white/10 bg-white/[0.035] p-3">
          {points.map((point) => (
            <div key={point.label} className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-normal" style={{ color: point.color }}>
                {point.label}
              </p>
              <p className="mt-1 truncate text-xs font-bold text-text">{point.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
