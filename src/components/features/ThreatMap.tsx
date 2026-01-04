import {
  type FC,
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

type ThreatTypeId = "ddos" | "malware" | "phishing" | "ransomware" | "intrusion";

interface ThreatType {
  id: ThreatTypeId;
  label: string;
  color: string;
}

interface Point {
  x: number;
  y: number;
}

interface Attack {
  id: string;
  origin: Point;
  target: Point;
  type: ThreatType;
  length: number;
  createdAt: number;
}

interface ThreatSimulationOptions {
  intervalMs: number;
  lifetimeMs: number;
  initialCount: number;
  maxActiveAttacks: number;
}

interface ThreatSimulationState {
  attacks: Attack[];
  threatCount: number;
}

interface ThreatMapProps {
  className?: string;
  title?: string;
  subtitle?: string;
  initialThreatCount?: number;
  maxActiveAttacks?: number;
  attackIntervalMs?: number;
  attackLifetimeMs?: number;
}

type CSSVarStyle = CSSProperties & {
  "--line-length"?: string;
  "--line-draw"?: string;
  "--line-fade"?: string;
  "--pulse-duration"?: string;
};

const VIEWBOX = {
  width: 1000,
  height: 500,
};

const DEFAULT_TITLE = "Live Threat Map";
const DEFAULT_SUBTITLE = "Simulated global cyber activity";
const DEFAULT_COPY = {
  threatsDetected: "Threats detected",
  liveFeed: "Live feed",
  activeStreams: "Active streams",
  threatTypes: "Threat types",
  simulationNotesTitle: "Simulation notes",
  simulationNotesBody:
    "Attack routes, sources, and targets are randomized for visual storytelling only.",
};

const DEFAULT_ATTACK_INTERVAL_MS = 500;
const DEFAULT_ATTACK_LIFETIME_MS = 2000;
const DEFAULT_LINE_DRAW_MS = 650;
const DEFAULT_PULSE_MS = 1200;
const DEFAULT_INITIAL_COUNT = 12840;
const DEFAULT_MAX_ACTIVE_ATTACKS = 14;

const THREAT_TYPES: ThreatType[] = [
  { id: "ddos", label: "DDoS", color: "#ef4444" },
  { id: "malware", label: "Malware", color: "#f97316" },
  { id: "phishing", label: "Phishing", color: "#38bdf8" },
  { id: "ransomware", label: "Ransomware", color: "#a3e635" },
  { id: "intrusion", label: "Intrusion", color: "#facc15" },
];

const HOTSPOTS: Point[] = [
  { x: 150, y: 120 },
  { x: 220, y: 170 },
  { x: 280, y: 140 },
  { x: 310, y: 280 },
  { x: 340, y: 340 },
  { x: 470, y: 120 },
  { x: 520, y: 160 },
  { x: 540, y: 230 },
  { x: 610, y: 150 },
  { x: 700, y: 170 },
  { x: 780, y: 210 },
  { x: 840, y: 320 },
];

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

const randomBetween = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

const randomFromArray = <T,>(items: readonly T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

const jitterPoint = (point: Point, amount: number): Point => {
  return {
    x: clamp(point.x + randomBetween(-amount, amount), 0, VIEWBOX.width),
    y: clamp(point.y + randomBetween(-amount, amount), 0, VIEWBOX.height),
  };
};

const getDistance = (origin: Point, target: Point): number => {
  return Math.hypot(target.x - origin.x, target.y - origin.y);
};

const pickDistinctHotspots = (): [Point, Point] => {
  const originIndex = Math.floor(Math.random() * HOTSPOTS.length);
  let targetIndex = Math.floor(Math.random() * HOTSPOTS.length);

  if (targetIndex === originIndex) {
    targetIndex = (targetIndex + 1) % HOTSPOTS.length;
  }

  return [HOTSPOTS[originIndex], HOTSPOTS[targetIndex]];
};

const createAttack = (): Attack => {
  const [originBase, targetBase] = pickDistinctHotspots();
  const jitterAmount = randomBetween(10, 26);
  let origin = jitterPoint(originBase, jitterAmount);
  let target = jitterPoint(targetBase, jitterAmount);
  let distance = getDistance(origin, target);
  let attempts = 0;

  while (distance < 140 && attempts < 6) {
    const [newOrigin, newTarget] = pickDistinctHotspots();
    origin = jitterPoint(newOrigin, jitterAmount);
    target = jitterPoint(newTarget, jitterAmount);
    distance = getDistance(origin, target);
    attempts += 1;
  }

  return {
    id: `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`,
    origin,
    target,
    type: randomFromArray(THREAT_TYPES),
    length: distance,
    createdAt: Date.now(),
  };
};

const usePrefersReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();

    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    (mediaQuery as any).addListener(updatePreference);
    return () => (mediaQuery as any).removeListener(updatePreference);
  }, []);

  return prefersReducedMotion;
};

const useThreatSimulation = ({
  intervalMs,
  lifetimeMs,
  initialCount,
  maxActiveAttacks,
}: ThreatSimulationOptions): ThreatSimulationState => {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [threatCount, setThreatCount] = useState<number>(initialCount);
  const timeoutsRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  const spawnAttack = useCallback(() => {
    const attack = createAttack();

    setAttacks((prev) => {
      const next = [attack, ...prev];
      return next.slice(0, maxActiveAttacks);
    });

    setThreatCount((prev) => prev + 1);

    const timeoutId = window.setTimeout(() => {
      setAttacks((prev) => prev.filter((item) => item.id !== attack.id));
      timeoutsRef.current = timeoutsRef.current.filter(
        (storedId) => storedId !== timeoutId,
      );
    }, lifetimeMs);

    timeoutsRef.current.push(timeoutId);
  }, [lifetimeMs, maxActiveAttacks]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    spawnAttack();
    intervalRef.current = window.setInterval(spawnAttack, intervalMs);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      timeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      timeoutsRef.current = [];
    };
  }, [intervalMs, spawnAttack]);

  return { attacks, threatCount };
};

/**
 * ThreatMap - Animated SVG world map that simulates live cyber threats.
 *
 * @example
 * <ThreatMap />
 */
export const ThreatMap: FC<ThreatMapProps> = ({
  className,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  initialThreatCount = DEFAULT_INITIAL_COUNT,
  maxActiveAttacks = DEFAULT_MAX_ACTIVE_ATTACKS,
  attackIntervalMs = DEFAULT_ATTACK_INTERVAL_MS,
  attackLifetimeMs = DEFAULT_ATTACK_LIFETIME_MS,
}) => {
  const uniqueId = useId();
  const reducedMotion = usePrefersReducedMotion();
  const { attacks, threatCount } = useThreatSimulation({
    intervalMs: attackIntervalMs,
    lifetimeMs: attackLifetimeMs,
    initialCount: initialThreatCount,
    maxActiveAttacks,
  });

  const formattedCount = useMemo(() => {
    return threatCount.toLocaleString();
  }, [threatCount]);
  const refreshLabel = useMemo(() => {
    const seconds = attackIntervalMs / 1000;
    const display =
      Math.abs(seconds - Math.round(seconds)) < 0.01
        ? seconds.toFixed(0)
        : seconds.toFixed(1);
    return `Refreshing every ${display}s`;
  }, [attackIntervalMs]);

  const oceanGradientId = `ocean-${uniqueId}`;
  const gridId = `grid-${uniqueId}`;
  const glowId = `glow-${uniqueId}`;

  const containerClassName = [
    "relative overflow-hidden rounded-2xl border border-slate-800/70",
    "bg-[radial-gradient(80%_120%_at_10%_0%,rgba(14,116,144,0.25),rgba(2,6,23,0.95))]",
    "p-6 shadow-[0_30px_80px_rgba(2,6,23,0.6)]",
    className ?? "",
  ]
    .join(" ")
    .trim();

  return (
    <section className={containerClassName}>
      <style>{`
        .threat-line {
          fill: none;
          stroke-width: 1.6;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 0.95;
          animation: line-draw var(--line-draw) ease-out forwards,
            line-fade var(--line-fade) ease-out forwards;
        }

        .threat-pulse {
          transform-origin: center;
          transform-box: fill-box;
          animation: pulse-dot var(--pulse-duration) ease-out infinite;
        }

        @keyframes line-draw {
          from {
            stroke-dashoffset: var(--line-length);
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes line-fade {
          0% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes pulse-dot {
          0% {
            transform: scale(0.4);
            opacity: 0.75;
          }
          70% {
            transform: scale(2.2);
            opacity: 0.15;
          }
          100% {
            transform: scale(2.6);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .threat-line,
          .threat-pulse {
            animation: none !important;
          }
        }
      `}</style>

      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
            {title}
          </p>
          <h3 className="mt-2 max-w-xl text-xl font-semibold text-slate-100">
            {subtitle}
          </h3>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
            {DEFAULT_COPY.threatsDetected}
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300 tabular-nums">
            {formattedCount}
          </p>
          <p className="mt-1 text-xs text-emerald-200/70">
            {DEFAULT_COPY.liveFeed}
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_220px]">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
          <svg
            role="img"
            aria-label="Global cyber threat activity map"
            viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
            className="h-auto w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id={oceanGradientId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <pattern
                id={gridId}
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="1"
                  opacity="0.22"
                />
              </pattern>
              <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect
              width={VIEWBOX.width}
              height={VIEWBOX.height}
              fill={`url(#${oceanGradientId})`}
              rx="18"
            />
            <rect
              width={VIEWBOX.width}
              height={VIEWBOX.height}
              fill={`url(#${gridId})`}
              opacity="0.35"
              rx="18"
            />

            <g className="fill-slate-900/80 stroke-slate-700/60">
              <path d="M120 70 L220 60 L320 90 L360 140 L330 200 L280 190 L240 220 L180 200 L120 140 Z" />
              <path d="M280 40 L330 30 L360 50 L340 70 L300 60 Z" />
              <path d="M300 240 L340 250 L370 300 L350 380 L310 420 L280 370 L270 300 Z" />
              <path d="M440 90 L520 80 L560 110 L540 140 L480 135 L450 120 Z" />
              <path d="M500 150 L560 190 L590 250 L560 330 L510 360 L470 300 L480 210 Z" />
              <path d="M560 100 L700 80 L840 120 L900 170 L880 220 L820 240 L760 220 L700 250 L620 210 L580 150 Z" />
              <path d="M760 320 L840 330 L870 370 L830 410 L760 390 Z" />
              <path d="M200 460 L800 460 L760 490 L240 490 Z" />
            </g>

            <g>
              {attacks.map((attack) => {
                const lineStyle: CSSVarStyle = {
                  "--line-length": `${attack.length}px`,
                  "--line-draw": `${DEFAULT_LINE_DRAW_MS}ms`,
                  "--line-fade": `${attackLifetimeMs}ms`,
                };

                const pulseStyle: CSSVarStyle = {
                  "--pulse-duration": `${DEFAULT_PULSE_MS}ms`,
                };

                const dashOffset = reducedMotion ? 0 : attack.length;

                return (
                  <g key={attack.id}>
                    <line
                      x1={attack.origin.x}
                      y1={attack.origin.y}
                      x2={attack.target.x}
                      y2={attack.target.y}
                      className="threat-line"
                      stroke={attack.type.color}
                      strokeDasharray={attack.length}
                      strokeDashoffset={dashOffset}
                      style={lineStyle}
                      filter={`url(#${glowId})`}
                    />
                    <circle
                      cx={attack.origin.x}
                      cy={attack.origin.y}
                      r={2.6}
                      fill={attack.type.color}
                      opacity={0.95}
                    />
                    <circle
                      cx={attack.origin.x}
                      cy={attack.origin.y}
                      r={6}
                      fill="none"
                      stroke={attack.type.color}
                      strokeWidth={1.2}
                      opacity={0.7}
                      className="threat-pulse"
                      style={pulseStyle}
                    />
                    <circle
                      cx={attack.target.x}
                      cy={attack.target.y}
                      r={1.6}
                      fill={attack.type.color}
                      opacity={0.45}
                    />
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <aside className="space-y-5 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
              {DEFAULT_COPY.activeStreams}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">
              {attacks.length.toString().padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs text-slate-400">{refreshLabel}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
              {DEFAULT_COPY.threatTypes}
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-200">
              {THREAT_TYPES.map((type) => (
                <li key={type.id} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: type.color }}
                    aria-hidden="true"
                  />
                  <span className="font-medium">{type.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800/60 bg-slate-950/70 p-3 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">
              {DEFAULT_COPY.simulationNotesTitle}
            </p>
            <p className="mt-2">{DEFAULT_COPY.simulationNotesBody}</p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default ThreatMap;
