import { type FC, useCallback, useEffect, useId, useState } from "react";
import { Calendar, ExternalLink, Loader2 } from "lucide-react";

/**
 * Display mode for the Calendly widget
 * - inline: Embeds the full scheduling widget directly in the page
 * - popup: Shows a button that opens Calendly in a popup/modal
 */
type CalendlyMode = "inline" | "popup";

interface CalendlyEmbedProps {
  /** Calendly scheduling URL (e.g., https://calendly.com/username/meeting-type) */
  url: string;
  /** Display mode: 'inline' embeds widget, 'popup' shows button */
  mode?: CalendlyMode;
  /** Height of the inline widget (only applies to inline mode) */
  height?: number;
  /** Minimum width of the inline widget (only applies to inline mode) */
  minWidth?: number;
  /** Button text for popup mode */
  buttonText?: string;
  /** Optional custom className for the container */
  className?: string;
  /** Hide Calendly branding in the widget */
  hideBranding?: boolean;
  /** Pre-fill name in the booking form */
  prefillName?: string;
  /** Pre-fill email in the booking form */
  prefillEmail?: string;
  /** Primary color for the widget (hex without #) */
  primaryColor?: string;
  /** Text color for the widget (hex without #) */
  textColor?: string;
  /** Background color for the widget (hex without #) */
  backgroundColor?: string;
}

const CALENDLY_WIDGET_SCRIPT =
  "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_WIDGET_CSS =
  "https://assets.calendly.com/assets/external/widget.css";

/**
 * Builds the Calendly URL with optional query parameters for customization
 */
const buildCalendlyUrl = (
  baseUrl: string,
  options: {
    hideBranding?: boolean;
    prefillName?: string;
    prefillEmail?: string;
    primaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
  },
): string => {
  const url = new URL(baseUrl);

  if (options.hideBranding) {
    url.searchParams.set("hide_gdpr_banner", "1");
    url.searchParams.set("hide_event_type_details", "0");
  }

  if (options.prefillName) {
    url.searchParams.set("name", options.prefillName);
  }

  if (options.prefillEmail) {
    url.searchParams.set("email", options.prefillEmail);
  }

  if (options.primaryColor) {
    url.searchParams.set("primary_color", options.primaryColor);
  }

  if (options.textColor) {
    url.searchParams.set("text_color", options.textColor);
  }

  if (options.backgroundColor) {
    url.searchParams.set("background_color", options.backgroundColor);
  }

  return url.toString();
};

/**
 * Hook to load the Calendly widget script dynamically
 */
const useCalendlyScript = (): boolean => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector(
      `script[src="${CALENDLY_WIDGET_SCRIPT}"]`,
    );
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    // Load CSS
    const existingCss = document.querySelector(
      `link[href="${CALENDLY_WIDGET_CSS}"]`,
    );
    if (!existingCss) {
      const link = document.createElement("link");
      link.href = CALENDLY_WIDGET_CSS;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    // Load script
    const script = document.createElement("script");
    script.src = CALENDLY_WIDGET_SCRIPT;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Calendly widget script");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup is optional since we want to keep the script loaded
    };
  }, []);

  return isLoaded;
};

/**
 * Inline Calendly widget that embeds directly in the page
 */
const CalendlyInline: FC<{
  url: string;
  height: number;
  minWidth: number;
  widgetId: string;
  isScriptLoaded: boolean;
}> = ({ url, height, minWidth, widgetId, isScriptLoaded }) => {
  useEffect(() => {
    if (!isScriptLoaded) return;

    // Initialize the inline widget using Calendly's API
    const calendly = (
      window as unknown as {
        Calendly?: { initInlineWidget: (opts: object) => void };
      }
    ).Calendly;
    if (calendly?.initInlineWidget) {
      calendly.initInlineWidget({
        url,
        parentElement: document.getElementById(widgetId),
        prefill: {},
        utm: {},
      });
    }
  }, [url, widgetId, isScriptLoaded]);

  return (
    <div className="relative">
      {!isScriptLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg"
          style={{ height, minWidth }}
        >
          <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Loading calendar...</span>
          </div>
        </div>
      )}
      <div
        id={widgetId}
        className="calendly-inline-widget w-full"
        data-url={url}
        style={{
          minWidth: `${minWidth}px`,
          height: `${height}px`,
          opacity: isScriptLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      />
    </div>
  );
};

/**
 * Popup button that opens Calendly in a modal
 */
const CalendlyPopup: FC<{
  url: string;
  buttonText: string;
  isScriptLoaded: boolean;
}> = ({ url, buttonText, isScriptLoaded }) => {
  const handleClick = useCallback(() => {
    const calendly = (
      window as unknown as {
        Calendly?: { initPopupWidget: (opts: { url: string }) => void };
      }
    ).Calendly;
    if (calendly?.initPopupWidget) {
      calendly.initPopupWidget({ url });
    } else {
      // Fallback: open in new tab if popup widget isn't available
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, [url]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isScriptLoaded}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      aria-label={buttonText}
    >
      {isScriptLoaded ? (
        <>
          <Calendar className="w-5 h-5" aria-hidden="true" />
          <span>{buttonText}</span>
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </>
      ) : (
        <>
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span>Loading...</span>
        </>
      )}
    </button>
  );
};

/**
 * CalendlyEmbed - Embed Calendly scheduling widget in your page
 *
 * Supports two modes:
 * - inline: Embeds the full scheduling interface directly in the page
 * - popup: Shows a button that opens Calendly in a popup modal
 *
 * @example
 * // Inline mode (default)
 * <CalendlyEmbed url="https://calendly.com/username/30min" />
 *
 * @example
 * // Popup mode
 * <CalendlyEmbed
 *   url="https://calendly.com/username/coffee-chat"
 *   mode="popup"
 *   buttonText="Schedule a Coffee Chat"
 * />
 *
 * @example
 * // With customization
 * <CalendlyEmbed
 *   url="https://calendly.com/username/meeting"
 *   height={500}
 *   primaryColor="10b981"
 *   hideBranding
 * />
 */
export const CalendlyEmbed: FC<CalendlyEmbedProps> = ({
  url,
  mode = "inline",
  height = 400,
  minWidth = 320,
  buttonText = "Schedule a Meeting",
  className,
  hideBranding,
  prefillName,
  prefillEmail,
  primaryColor,
  textColor,
  backgroundColor,
}) => {
  const widgetId = useId();
  const isScriptLoaded = useCalendlyScript();

  const calendlyUrl = buildCalendlyUrl(url, {
    hideBranding,
    prefillName,
    prefillEmail,
    primaryColor,
    textColor,
    backgroundColor,
  });

  return (
    <div className={className}>
      {mode === "inline" ? (
        <CalendlyInline
          url={calendlyUrl}
          height={height}
          minWidth={minWidth}
          widgetId={`calendly-widget-${widgetId}`}
          isScriptLoaded={isScriptLoaded}
        />
      ) : (
        <CalendlyPopup
          url={calendlyUrl}
          buttonText={buttonText}
          isScriptLoaded={isScriptLoaded}
        />
      )}
    </div>
  );
};

export default CalendlyEmbed;
