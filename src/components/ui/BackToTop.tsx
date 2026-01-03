import { type FC, useCallback, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const VISIBILITY_THRESHOLD_PX = 300;

/**
 * Track scroll position and toggle visibility past a threshold.
 */
function useScrollVisibility(thresholdPx: number): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const updateVisibility = useCallback((): void => {
    setIsVisible(window.scrollY >= thresholdPx);
  }, [thresholdPx]);

  useEffect(() => {
    let ticking = false;

    const onScroll = (): void => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateVisibility();

    return () => window.removeEventListener("scroll", onScroll);
  }, [updateVisibility]);

  return isVisible;
}

/**
 * BackToTop - Floating button that scrolls the page to the top.
 *
 * @example
 * <BackToTop />
 */
interface BackToTopProps {}

export const BackToTop: FC<BackToTopProps> = () => {
  const isVisible = useScrollVisibility(VISIBILITY_THRESHOLD_PX);

  const handleClick = useCallback((): void => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      <button
        type="button"
        onClick={handleClick}
        className={`
          group inline-flex h-11 w-11 items-center justify-center rounded-full border
          border-gray-200/70 bg-white/90 text-gray-900 shadow-lg backdrop-blur
          transition-all duration-300 ease-out
          hover:-translate-y-0.5 hover:shadow-xl
          focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
          dark:border-gray-700/70 dark:bg-gray-900/80 dark:text-white dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-gray-900
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
          motion-reduce:transition-none motion-reduce:transform-none
        `}
        aria-label="Back to top"
        title="Back to top"
        aria-hidden={!isVisible}
        tabIndex={isVisible ? 0 : -1}
      >
        <ArrowUp
          size={18}
          className="text-emerald-600 dark:text-emerald-400 transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

export default BackToTop;
