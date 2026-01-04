import { type FC, useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { themeStore } from "../../stores/theme";

const STORAGE_KEY = "crt-booted";
const BOOT_DURATION_MS = 780;
const READY_HOLD_MS = 120;
const PROGRESS_STEPS = 9;
const BAR_WIDTH = 16;

type BootState = "idle" | "active" | "hidden";

type BootSequenceProps = {};

const usePrefersReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
};

const buildLoadingArt = (progress: number): string => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  const filled = Math.round((clamped / 100) * BAR_WIDTH);
  const bar = `${"=".repeat(filled)}${" ".repeat(BAR_WIDTH - filled)}`;
  const percent = `${clamped}`.padStart(3, " ");

  return [
    "  .----------------------.",
    "  | CRT BOOT SEQUENCE     |",
    `  | [${bar}] ${percent}% |`,
    "  '----------------------'",
  ].join("\n");
};

/**
 * BootSequence - CRT-style boot overlay shown once per device in Hacker mode.
 *
 * @example
 * <BootSequence />
 */
export const BootSequence: FC<BootSequenceProps> = () => {
  const theme = useStore(themeStore);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [bootState, setBootState] = useState<BootState>("idle");
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (theme !== "hacker") {
      setBootState("idle");
      setProgress(0);
      setIsReady(false);
      return;
    }

    let hasBooted = false;
    try {
      hasBooted = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      hasBooted = false;
    }

    if (hasBooted) return;

    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Intentionally empty.
    }

    setBootState("active");
    setProgress(0);
    setIsReady(false);

    if (prefersReducedMotion) {
      setProgress(100);
      setIsReady(true);
      const hideId = window.setTimeout(() => setBootState("hidden"), 200);
      return () => window.clearTimeout(hideId);
    }

    const stepDuration = Math.max(
      50,
      Math.floor(BOOT_DURATION_MS / PROGRESS_STEPS),
    );
    let step = 0;

    const intervalId = window.setInterval(() => {
      step += 1;
      const nextProgress = Math.min(
        100,
        Math.round((step / PROGRESS_STEPS) * 100),
      );
      setProgress(nextProgress);

      if (step >= PROGRESS_STEPS) {
        window.clearInterval(intervalId);
        setIsReady(true);
      }
    }, stepDuration);

    const hideId = window.setTimeout(() => {
      setBootState("hidden");
    }, BOOT_DURATION_MS + READY_HOLD_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(hideId);
    };
  }, [prefersReducedMotion, theme]);

  if (bootState === "idle") return null;

  const asciiArt = buildLoadingArt(progress);

  return (
    <div
      className="crt-boot"
      data-state={bootState === "active" ? "active" : "hidden"}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="crt-boot__content">
        <p className="crt-boot__line">INITIALIZING...</p>
        <pre className="crt-boot__ascii">{asciiArt}</pre>
        <p className="crt-boot__status" data-ready={isReady ? "true" : "false"}>
          {isReady ? "SYSTEM READY" : "LOADING SYSTEM..."}
        </p>
      </div>
    </div>
  );
};

export default BootSequence;
