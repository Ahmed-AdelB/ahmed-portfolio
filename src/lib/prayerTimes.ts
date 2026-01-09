import { SITE_CONFIG } from "../site.config";

export interface PrayerTime {
  name: string;
  time: string; // HH:MM format
}

const API_URL = SITE_CONFIG.api.aladhan;
const DEFAULT_CITY = "Cairo";
const DEFAULT_COUNTRY = "Egypt";
const CACHE_KEY = "prayer_times_cache";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedData {
  timestamp: number;
  timings: Record<string, string>;
}

export async function getNextPrayer(): Promise<PrayerTime | null> {
  let timings: Record<string, string> | null = null;

  // Try to get from cache
  const cached =
    typeof localStorage !== "undefined"
      ? localStorage.getItem(CACHE_KEY)
      : null;
  if (cached) {
    try {
      const parsed: CachedData = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        timings = parsed.timings;
      }
    } catch (e) {
      console.error("Failed to parse prayer times cache", e);
    }
  }

  // Fetch if not in cache or expired
  if (!timings) {
    try {
      // Format date as DD-MM-YYYY for the API if needed, but timingsByCity usually takes query params
      // actually timingsByCity takes date, city, country, method.
      // The endpoint is /timingsByCity/:date or query params.
      // Using query params: date (optional, defaults to today), city, country.

      const url = new URL(API_URL);
      url.searchParams.append("city", DEFAULT_CITY);
      url.searchParams.append("country", DEFAULT_COUNTRY);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch prayer times");

      const data = await response.json();
      if (data.code === 200 && data.data && data.data.timings) {
        timings = data.data.timings;
        // Cache it
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              timings: timings,
            }),
          );
        }
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      return null;
    }
  }

  if (!timings) return null;

  // Calculate next prayer
  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeVal = currentHours * 60 + currentMinutes;

  for (const prayer of prayers) {
    const timeStr = timings[prayer]; // "HH:MM"
    if (!timeStr) continue;

    const [hours, minutes] = timeStr.split(":").map(Number);
    const prayerTimeVal = hours * 60 + minutes;

    if (prayerTimeVal > currentTimeVal) {
      return { name: prayer, time: timeStr };
    }
  }

  // If no prayer found later today, return Fajr of tomorrow (simplified to just return Fajr time from today's data as "Next" loosely)
  // Or strictly we should fetch tomorrow's data, but usually displaying today's Fajr is acceptable or we wrap around.
  // For simplicity: return Fajr and mark it as next.
  return { name: "Fajr", time: timings["Fajr"] };
}
