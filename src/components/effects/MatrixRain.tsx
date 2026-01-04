import { type CSSProperties, type FC, useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import {
  disableMatrix,
  enableMatrix,
  isMatrixEnabled,
  toggleMatrix,
  matrixIntensity,
} from "../../stores/matrix";

const MATRIX_CHARACTERS = Array.from(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-/",
);

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_FADE_ALPHA = 0.08;
const DEFAULT_MIN_SPEED = 0.9;
const DEFAULT_MAX_SPEED = 2.6;
const DEFAULT_RESET_THRESHOLD = 0.975;
const DEFAULT_OVERLAY_OPACITY = 0.7;
const DEFAULT_Z_INDEX = 80;
const DEFAULT_HEAD_HIGHLIGHT_CHANCE = 0.08;
const DEFAULT_TRAIL_COLOR = "#00ff6a";
const DEFAULT_HEAD_COLOR = "#c8ffd8";
const DEFAULT_GLOW_COLOR = "rgba(0, 255, 106, 0.6)";
const DEFAULT_GLOW_BLUR = 6;
const DEFAULT_FONT_FAMILY =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const randomBetween = (min: number, max: number): number =>
  min + Math.random() * (max - min);

const usePrefersReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = () => {
      setReducedMotion(mediaQuery.matches);
    };

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return reducedMotion;
};

/**
 * startMatrixRain - Enable the Matrix Rain overlay.
 */
export const startMatrixRain = (): void => {
  enableMatrix();
};

/**
 * stopMatrixRain - Disable the Matrix Rain overlay.
 */
export const stopMatrixRain = (): void => {
  disableMatrix();
};

/**
 * toggleMatrixRain - Toggle the Matrix Rain overlay.
 */
export const toggleMatrixRain = (): void => {
  toggleMatrix();
};

interface MatrixRainProps {
  /** Optional class name for the overlay container. */
  className?: string;
  /** Overlay opacity from 0 to 1. */
  overlayOpacity?: number;
  /** z-index for the overlay. */
  zIndex?: number;
}

/**
 * MatrixRain - Full-screen Matrix-style rain effect rendered with canvas.
 *
 * @example
 * <MatrixRain />
 */
export const MatrixRain: FC<MatrixRainProps> = ({
  className,
  overlayOpacity = DEFAULT_OVERLAY_OPACITY,
  zIndex = DEFAULT_Z_INDEX,
}) => {
  const isEnabled = useStore(isMatrixEnabled);
  const intensity = useStore(matrixIntensity);
  const prefersReducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const dropsRef = useRef<number[]>([]);
  const speedsRef = useRef<number[]>([]);
  const sizeRef = useRef({ width: 0, height: 0, columns: 0 });

  useEffect(() => {
    if (!isEnabled || prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const fontSize = DEFAULT_FONT_SIZE;
    const fadeAlpha = Math.max(0.01, DEFAULT_FADE_ALPHA / intensity); // Slower fade for more trails
    const resetThreshold = Math.max(0.8, DEFAULT_RESET_THRESHOLD - (intensity - 1) * 0.05);
    const headHighlightChance = DEFAULT_HEAD_HIGHLIGHT_CHANCE * intensity;
    const speedMultiplier = (prefersReducedMotion ? 0.5 : 1) * intensity;

    const resetColumns = (width: number, height: number) => {
      const columns = Math.max(1, Math.ceil(width / fontSize));
      sizeRef.current = { width, height, columns };
      dropsRef.current = Array.from({ length: columns }, () =>
        randomBetween(-height, 0),
      );
      speedsRef.current = Array.from({ length: columns }, () =>
        randomBetween(DEFAULT_MIN_SPEED, DEFAULT_MAX_SPEED) *
        fontSize *
        speedMultiplier,
      );
    };

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const devicePixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * devicePixelRatio);
      canvas.height = Math.floor(height * devicePixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      resetColumns(width, height);

      context.fillStyle = "rgba(0, 0, 0, 1)";
      context.fillRect(0, 0, width, height);
    };

    const drawFrame = () => {
      const { width, height, columns } = sizeRef.current;
      if (columns === 0) {
        animationRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      context.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
      context.fillRect(0, 0, width, height);

      context.font = `${fontSize}px ${DEFAULT_FONT_FAMILY}`;
      context.textBaseline = "top";
      context.shadowBlur = DEFAULT_GLOW_BLUR;
      context.shadowColor = DEFAULT_GLOW_COLOR;
      context.fillStyle = DEFAULT_TRAIL_COLOR;

      const drops = dropsRef.current;
      const speeds = speedsRef.current;

      for (let index = 0; index < columns; index += 1) {
        const x = index * fontSize;
        const y = drops[index] ?? 0;
        const charIndex = Math.floor(Math.random() * MATRIX_CHARACTERS.length);
        const glyph = MATRIX_CHARACTERS[charIndex] ?? "";
        const highlight = Math.random() < headHighlightChance;

        if (highlight) {
          context.fillStyle = DEFAULT_HEAD_COLOR;
          context.fillText(glyph, x, y);
          context.fillStyle = DEFAULT_TRAIL_COLOR;
        } else {
          context.fillText(glyph, x, y);
        }

        if (y > height && Math.random() > resetThreshold) {
          drops[index] = randomBetween(-height, 0);
          speeds[index] =
            randomBetween(DEFAULT_MIN_SPEED, DEFAULT_MAX_SPEED) *
            fontSize *
            speedMultiplier;
        } else {
          drops[index] = y + (speeds[index] ?? fontSize);
        }
      }

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    resizeCanvas();
    drawFrame();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = null;
    };
  }, [isEnabled, prefersReducedMotion, intensity]);

  if (!isEnabled || prefersReducedMotion) return null;

  const overlayStyle = {
    opacity: clamp(overlayOpacity, 0, 1),
    zIndex,
  } satisfies CSSProperties;

  const overlayClassName = [
    "pointer-events-none fixed inset-0",
    "mix-blend-screen",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={overlayClassName} style={overlayStyle}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        aria-hidden="true"
        role="presentation"
      />
    </div>
  );
};

export default MatrixRain;
