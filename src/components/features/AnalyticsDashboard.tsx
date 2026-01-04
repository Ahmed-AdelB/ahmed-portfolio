import { type FC, useEffect, useMemo, useState, useId } from "react";

interface AnalyticsDashboardProps {
  className?: string;
}

interface TrafficSource {
  label: string;
  count: number;
}

interface PageStat {
  path: string;
  views: number;
}

interface DailyMetric {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  referrers: TrafficSource[];
  pages: PageStat[];
}

interface AnalyticsStore {
  days: DailyMetric[];
  lastUpdated: string;
}

interface AggregatedSource {
  label: string;
  count: number;
  percent: number;
  color: string;
  dotClass: string;
}

interface AggregatedPage {
  path: string;
  views: number;
}

interface TimelinePoint {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
}

interface AnalyticsAggregates {
  timeline: TimelinePoint[];
  pageViewsTotal: number;
  uniqueVisitorsTotal: number;
  sources: AggregatedSource[];
  pages: AggregatedPage[];
}

interface AnalyticsStoreResult {
  store: AnalyticsStore | null;
  liveVisitors: number;
}

const STORAGE_KEY = "analytics:dashboard:v1";
const DAYS_TO_SHOW = 7;
const REFRESH_INTERVAL_MS = 3200;

const TRAFFIC_SOURCES: Array<{ label: string; color: string; dotClass: string }> = [
  { label: "Direct", color: "#22d3ee", dotClass: "bg-cyan-400" },
  { label: "Search", color: "#22c55e", dotClass: "bg-emerald-500" },
  { label: "Social", color: "#f97316", dotClass: "bg-orange-500" },
  { label: "Referral", color: "#a855f7", dotClass: "bg-fuchsia-500" },
  { label: "Email", color: "#f43f5e", dotClass: "bg-rose-500" },
];

const POPULAR_PAGES = [
  "/",
  "/projects",
  "/blog",
  "/about",
  "/contact",
  "/resume",
  "/playground",
];

const numberFormatter = new Intl.NumberFormat("en-US");

const formatNumber = (value: number): string => numberFormatter.format(value);

const pad = (value: number): string => value.toString().padStart(2, "0");

const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const parseDateKey = (key: string): Date => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

const formatShortDate = (key: string): string => {
  const date = parseDateKey(key);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sumValues = (values: number[]): number =>
  values.reduce((total, current) => total + current, 0);

const createReferrers = (pageViews: number): TrafficSource[] => {
  const weights = TRAFFIC_SOURCES.map(() => 0.6 + Math.random());
  const weightSum = sumValues(weights);
  return TRAFFIC_SOURCES.map((source, index) => {
    const share = weights[index] / weightSum;
    return {
      label: source.label,
      count: Math.max(6, Math.round(pageViews * share * 0.8)),
    };
  });
};

const createPageStats = (pageViews: number): PageStat[] => {
  const weights = POPULAR_PAGES.map(() => 0.6 + Math.random());
  const weightSum = sumValues(weights);
  return POPULAR_PAGES.map((path, index) => {
    const share = weights[index] / weightSum;
    return {
      path,
      views: Math.max(8, Math.round(pageViews * share * 0.9)),
    };
  });
};

const createMockDay = (date: Date, baseViews: number): DailyMetric => {
  const pageViews = clamp(Math.round(baseViews + randomBetween(-20, 40)), 120, 1200);
  const uniqueVisitors = clamp(
    Math.round(pageViews * (0.42 + Math.random() * 0.18)),
    40,
    pageViews - 8,
  );

  return {
    date: formatDateKey(date),
    pageViews,
    uniqueVisitors,
    referrers: createReferrers(pageViews),
    pages: createPageStats(pageViews),
  };
};

const createMockDays = (today: Date): DailyMetric[] => {
  const days: DailyMetric[] = [];
  let baseViews = randomBetween(240, 520);

  for (let offset = DAYS_TO_SHOW - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    baseViews = clamp(baseViews + randomBetween(-50, 70), 140, 1100);
    days.push(createMockDay(date, baseViews));
  }

  return days;
};

const createMockStore = (): AnalyticsStore => {
  const today = new Date();
  return {
    days: createMockDays(today),
    lastUpdated: new Date().toISOString(),
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const normalizeStore = (store: AnalyticsStore): AnalyticsStore => {
  const todayKey = formatDateKey(new Date());

  if (!Array.isArray(store.days) || store.days.length === 0) {
    return createMockStore();
  }

  const hasValidDays = store.days.every((day) => {
    if (!isRecord(day)) return false;
    return (
      typeof day.date === "string" &&
      typeof day.pageViews === "number" &&
      typeof day.uniqueVisitors === "number" &&
      Array.isArray(day.referrers) &&
      Array.isArray(day.pages)
    );
  });

  if (!hasValidDays) {
    return createMockStore();
  }

  let days = [...store.days];
  const lastKey = days[days.length - 1]?.date;

  if (!lastKey) {
    return createMockStore();
  }

  let cursorDate = parseDateKey(lastKey);
  const todayDate = parseDateKey(todayKey);

  while (cursorDate < todayDate) {
    const nextDate = new Date(cursorDate);
    nextDate.setDate(cursorDate.getDate() + 1);
    const previous = days[days.length - 1];
    const nextBase = previous ? Math.round(previous.pageViews * (0.9 + Math.random() * 0.2)) : 320;
    days = [...days, createMockDay(nextDate, nextBase)];
    cursorDate = nextDate;
  }

  if (days.length > DAYS_TO_SHOW) {
    days = days.slice(days.length - DAYS_TO_SHOW);
  }

  if (days.length !== DAYS_TO_SHOW) {
    days = createMockDays(new Date());
  }

  return {
    ...store,
    days,
    lastUpdated: new Date().toISOString(),
  };
};

const loadAnalyticsStore = (): AnalyticsStore => {
  if (typeof window === "undefined") {
    return createMockStore();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = createMockStore();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || !Array.isArray(parsed.days)) {
      const fresh = createMockStore();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }

    const normalized = normalizeStore(parsed as unknown as AnalyticsStore);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    const fallback = createMockStore();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    } catch {
      // localStorage can fail in private modes; ignore and use in-memory fallback.
    }
    return fallback;
  }
};

const persistStore = (store: AnalyticsStore): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore persistence errors to keep UI responsive.
  }
};

const bumpTodayMetrics = (store: AnalyticsStore): AnalyticsStore => {
  if (store.days.length === 0) return store;

  const days = [...store.days];
  const todayIndex = days.length - 1;
  const today = days[todayIndex];

  const pageBump = randomBetween(1, 6);
  const uniqueBump = Math.random() > 0.45 ? randomBetween(0, 2) : 0;
  const referrerIndex = randomBetween(0, today.referrers.length - 1);
  const pageIndex = randomBetween(0, today.pages.length - 1);

  const updatedReferrers = today.referrers.map((source, index) => {
    if (index !== referrerIndex) return source;
    return { ...source, count: source.count + Math.max(1, Math.round(pageBump * 0.7)) };
  });

  const updatedPages = today.pages.map((page, index) => {
    if (index !== pageIndex) return page;
    return { ...page, views: page.views + pageBump };
  });

  const nextPageViews = today.pageViews + pageBump;
  const nextUnique = clamp(today.uniqueVisitors + uniqueBump, today.uniqueVisitors, nextPageViews - 2);

  days[todayIndex] = {
    ...today,
    pageViews: nextPageViews,
    uniqueVisitors: nextUnique,
    referrers: updatedReferrers,
    pages: updatedPages,
  };

  return {
    ...store,
    days,
    lastUpdated: new Date().toISOString(),
  };
};

const calculateLiveVisitors = (store: AnalyticsStore): number => {
  const latest = store.days[store.days.length - 1];
  const baseline = Math.max(1, Math.round(latest.uniqueVisitors * 0.08));
  return clamp(baseline + randomBetween(-3, 6), 1, 120);
};

const buildAggregates = (store: AnalyticsStore): AnalyticsAggregates => {
  const timeline: TimelinePoint[] = store.days.map((day) => ({
    date: day.date,
    pageViews: day.pageViews,
    uniqueVisitors: day.uniqueVisitors,
  }));

  const pageViewsTotal = sumValues(store.days.map((day) => day.pageViews));
  const uniqueVisitorsTotal = sumValues(store.days.map((day) => day.uniqueVisitors));

  const referrerMap = new Map<string, number>();
  const pageMap = new Map<string, number>();

  store.days.forEach((day) => {
    day.referrers.forEach((source) => {
      referrerMap.set(source.label, (referrerMap.get(source.label) ?? 0) + source.count);
    });

    day.pages.forEach((page) => {
      pageMap.set(page.path, (pageMap.get(page.path) ?? 0) + page.views);
    });
  });

  const referrerTotal = sumValues(Array.from(referrerMap.values()));
  const sources: AggregatedSource[] = Array.from(referrerMap.entries())
    .map(([label, count]) => {
      const config = TRAFFIC_SOURCES.find((source) => source.label === label) ?? {
        label,
        color: "#94a3b8",
        dotClass: "bg-slate-400",
      };
      return {
        label,
        count,
        percent: referrerTotal === 0 ? 0 : Math.round((count / referrerTotal) * 100),
        color: config.color,
        dotClass: config.dotClass,
      };
    })
    .sort((a, b) => b.count - a.count);

  const pages: AggregatedPage[] = Array.from(pageMap.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return {
    timeline,
    pageViewsTotal,
    uniqueVisitorsTotal,
    sources,
    pages,
  };
};

const useAnalyticsStore = (): AnalyticsStoreResult => {
  const [store, setStore] = useState<AnalyticsStore | null>(null);
  const [liveVisitors, setLiveVisitors] = useState<number>(0);

  useEffect(() => {
    const initial = loadAnalyticsStore();
    setStore(initial);
    setLiveVisitors(calculateLiveVisitors(initial));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const intervalId = window.setInterval(() => {
      setStore((current) => {
        if (!current) return current;
        const updated = bumpTodayMetrics(current);
        persistStore(updated);
        setLiveVisitors(calculateLiveVisitors(updated));
        return updated;
      });
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return { store, liveVisitors };
};

interface StatCardProps {
  label: string;
  value: string;
  helper: string;
  accentClass?: string;
  ariaLive?: "off" | "polite" | "assertive";
}

const StatCard: FC<StatCardProps> = ({ label, value, helper, accentClass, ariaLive = "off" }) => {
  return (
    <div className="rounded-lg border bg-background/50 p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accentClass ?? ""}`.trim()} aria-live={ariaLive}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
};

interface LineChartProps {
  values: number[];
  labels: string[];
}

const LineChart: FC<LineChartProps> = ({ values, labels }) => {
  const gradientId = useId();
  const width = 320;
  const height = 140;
  const padding = 16;

  if (values.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center text-xs text-muted-foreground">
        No timeline data available.
      </div>
    );
  }

  const maxValue = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (value / maxValue) * (height - padding * 2);
    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? padding} ${height - padding} L ${
    points[0]?.x ?? padding
  } ${height - padding} Z`;

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-36 w-full"
        role="img"
        aria-label="Visitor timeline for the last 7 days"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="text-primary">
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2" />
          {points.map((point) => (
            <circle
              key={`${point.x}-${point.y}`}
              cx={point.x}
              cy={point.y}
              r={2.5}
              className="fill-primary"
            />
          ))}
        </g>
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
};

interface PieChartProps {
  sources: AggregatedSource[];
}

const PieChart: FC<PieChartProps> = ({ sources }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (sources.length === 0) {
    return (
      <div className="flex h-36 w-36 items-center justify-center rounded-full border border-dashed text-xs text-muted-foreground">
        No data
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 120 120"
      className="h-36 w-36"
      role="img"
      aria-label="Traffic sources breakdown"
    >
      <g transform="translate(60 60) rotate(-90)">
        {sources.map((source) => {
          const length = (source.percent / 100) * circumference;
          const dashArray = `${length} ${circumference - length}`;
          const dashOffset = -offset;
          offset += length;

          return (
            <circle
              key={source.label}
              r={radius}
              fill="transparent"
              stroke={source.color}
              strokeWidth="16"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <text
        x="60"
        y="64"
        textAnchor="middle"
        className="fill-foreground text-xs font-semibold"
      >
        Sources
      </text>
    </svg>
  );
};

/**
 * Analytics dashboard with localStorage-powered mock data and SVG charts.
 */
export const AnalyticsDashboard: FC<AnalyticsDashboardProps> = ({ className }) => {
  const { store, liveVisitors } = useAnalyticsStore();

  const aggregates = useMemo(() => {
    if (!store) {
      return {
        timeline: [],
        pageViewsTotal: 0,
        uniqueVisitorsTotal: 0,
        sources: [],
        pages: [],
      };
    }

    return buildAggregates(store);
  }, [store]);

  if (!store) {
    return (
      <div className={`w-full ${className ?? ""}`.trim()}>
        <div className="rounded-xl border bg-card/80 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const latest = store.days[store.days.length - 1];
  const topSource = aggregates.sources[0];
  const timelineLabels = aggregates.timeline.map((point) => formatShortDate(point.date));
  const timelineValues = aggregates.timeline.map((point) => point.pageViews);
  const maxPageViews = aggregates.pages[0]?.views ?? 1;

  return (
    <section className={`w-full ${className ?? ""}`.trim()}>
      <div className="rounded-xl border bg-card/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-mono tracking-tight">Visitor Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Last 7 days - Updated {formatTime(store.lastUpdated)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            LIVE FEED
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Page Views"
            value={formatNumber(aggregates.pageViewsTotal)}
            helper="Total (7 days)"
          />
          <StatCard
            label="Unique Visitors"
            value={formatNumber(aggregates.uniqueVisitorsTotal)}
            helper="Total (7 days)"
          />
          <StatCard
            label="Today"
            value={formatNumber(latest.pageViews)}
            helper="Page views today"
            accentClass="text-primary"
          />
          <StatCard
            label="Live Visitors"
            value={formatNumber(liveVisitors)}
            helper="Currently active"
            accentClass="text-emerald-400"
            ariaLive="polite"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-lg border bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Visitor Timeline
              </h3>
              <span className="text-xs text-muted-foreground">Page views</span>
            </div>
            <div className="mt-4">
              <LineChart values={timelineValues} labels={timelineLabels} />
            </div>
          </div>

          <div className="rounded-lg border bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Traffic Sources
              </h3>
              <span className="text-xs text-muted-foreground">Referrers</span>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <PieChart sources={aggregates.sources} />
              <div className="flex-1 space-y-3">
                {aggregates.sources.map((source) => (
                  <div key={source.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${source.dotClass}`} aria-hidden="true" />
                      <span>{source.label}</span>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {source.percent}% | {formatNumber(source.count)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {topSource && (
              <p className="mt-4 text-xs text-muted-foreground">
                Top referrer: <span className="text-foreground">{topSource.label}</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-lg border bg-background/50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Popular Pages
            </h3>
            <span className="text-xs text-muted-foreground">Top 5</span>
          </div>
          <div className="mt-4 space-y-3">
            {aggregates.pages.map((page) => (
              <div key={page.path} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{page.path}</span>
                  <span className="text-xs text-muted-foreground">{formatNumber(page.views)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary/70"
                    style={{ width: `${(page.views / maxPageViews) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
