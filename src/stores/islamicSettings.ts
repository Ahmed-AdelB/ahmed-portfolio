import { atom } from "nanostores";

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export const showPrayerTimes = atom<boolean>(true);
export const userLocation = atom({ city: "Dublin", country: "Ireland" });
export const nextPrayer = atom<{ name: string; time: string } | null>(null);
