export type PrimaryTab = "prayer" | "quran" | "tools" | "assistant" | "spec";

export type ToolSubTab = "tasbih" | "hadith" | "calendar" | "zakat" | "halal";

export interface LocationState {
  city: string;
  country: string;
  lat: number;
  lng: number;
  source: "preset" | "gps" | "search";
}

export interface PrayerTimingsResponse {
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
  };
  date: {
    readable: string;
    hijri: {
      date: string;
      day: string;
      month: { number: number; en: string; ar: string };
      year: string;
      weekday: { en: string; ar: string };
    };
    gregorian: {
      date: string;
      day: string;
      month: { number: number; en: string };
      year: string;
      weekday: { en: string };
    };
  };
  meta: {
    timezone: string;
    method: { id: number; name: string };
  };
  qiblaBearing: number;
  distanceToMakkahKm: number;
}

export interface MonthlyPrayerDay {
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  date: {
    readable: string;
    gregorian: { day: string; month: { en: string }; year: string; weekday: { en: string } };
    hijri: { day: string; month: { en: string; ar: string }; year: string };
  };
}

export interface SurahSummary {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface AyahDetail {
  globalNumber: number;
  numberInSurah: number;
  juz: number;
  page: number;
  arabic: string;
  sahih: string;
  pickthall: string;
  audioUrl: string;
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  qari: string;
  ayahs: AyahDetail[];
}

export interface QuranBookmark {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicPreview: string;
  translationPreview: string;
  createdAt: string;
}

export interface QuranNote {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  note: string;
  updatedAt: string;
}

export interface TasbihLog {
  id: string;
  phrase: string;
  arabic: string;
  count: number;
  target: number;
  completedAt: string;
}

export interface HadithItem {
  id: string;
  collection: "Sahih al-Bukhari" | "Sahih Muslim" | "Sunan Abi Dawud" | "Jami' at-Tirmidhi";
  reference: string;
  topic: string;
  narrator: string;
  arabic: string;
  english: string;
  grade: "Sahih" | "Hasan";
}

export interface DuaItem {
  id: string;
  category: "Morning & Evening" | "Travel" | "Anxiety & Relief" | "Forgiveness" | "Daily Sunnah";
  title: string;
  arabic: string;
  transliteration: string;
  english: string;
  reference: string;
}

export interface HalalPlace {
  id: string;
  name: string;
  category: "mosque" | "halal";
  cuisine: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  bearingDeg: number;
  openingHours: string | null;
  phone: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
