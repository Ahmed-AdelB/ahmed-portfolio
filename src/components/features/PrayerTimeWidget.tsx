import React, { useState, useEffect } from "react";
import { getNextPrayer, type PrayerTime } from "../../lib/prayerTimes";

export const PrayerTimeWidget: React.FC = () => {
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrayer = async () => {
      try {
        const prayer = await getNextPrayer();
        setNextPrayer(prayer);
      } catch (error) {
        console.error("Failed to load prayer times", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayer();
    // Refresh every minute to check if "next" has changed
    const interval = setInterval(fetchPrayer, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible || loading || !nextPrayer) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-40 font-mono text-xs cursor-pointer group"
      onClick={() => setIsVisible(false)}
    >
      <div className="flex items-center gap-2 bg-black/80 border border-green-500/30 text-green-500 px-3 py-1.5 rounded shadow-[0_0_10px_rgba(34,197,94,0.1)] backdrop-blur-sm hover:bg-green-500/10 transition-colors">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="opacity-70">NEXT CRON:</span>
        <span className="font-bold">
          {nextPrayer.name.toUpperCase()} {nextPrayer.time}
        </span>
        <span className="ml-2 text-[10px] opacity-0 group-hover:opacity-50 transition-opacity">
          [CLICK TO HIDE]
        </span>
      </div>
    </div>
  );
};
