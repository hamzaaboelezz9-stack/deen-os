import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const apiCache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    apiCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T, ttlMs = 1000 * 60 * 30): void {
  apiCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function calculateQiblaBearing(lat: number, lng: number): number {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA_LAT);
  const deltaLambda = toRad(KAABA_LNG - lng);
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "DeenOS-App/1.0",
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Upstream HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "deenos-api" });
  });

  // 1. Prayer Timings + Qibla Bearing (Aladhan API)
  app.get("/api/prayer/timings", async (req, res) => {
    const lat = Number(req.query.lat ?? 21.4225);
    const lng = Number(req.query.lng ?? 39.8262);
    const method = Number(req.query.method ?? 2);
    const school = Number(req.query.school ?? 0);
    const dateParam = typeof req.query.date === "string" ? req.query.date : "";

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const formattedDate = dateParam || `${dd}-${mm}-${yyyy}`;

    const cacheKey = `timings:${lat.toFixed(3)}:${lng.toFixed(3)}:${method}:${school}:${formattedDate}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    try {
      const url = `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
      const json = await fetchJsonWithTimeout<{ code: number; data: unknown }>(url, 9000);
      const qiblaBearing = Number(calculateQiblaBearing(lat, lng).toFixed(2));
      const distanceToMakkahKm = Math.round(
        haversineDistanceKm(lat, lng, KAABA_LAT, KAABA_LNG)
      );
      const payload = {
        ...(json.data as Record<string, unknown>),
        qiblaBearing,
        distanceToMakkahKm,
      };
      setCached(cacheKey, payload, 1000 * 60 * 30);
      res.json(payload);
    } catch (err) {
      res.status(502).json({
        error: "Unable to reach Aladhan prayer times service.",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });

  // 2. Monthly Prayer Calendar (Aladhan API)
  app.get("/api/prayer/calendar", async (req, res) => {
    const lat = Number(req.query.lat ?? 21.4225);
    const lng = Number(req.query.lng ?? 39.8262);
    const method = Number(req.query.method ?? 2);
    const school = Number(req.query.school ?? 0);
    const now = new Date();
    const month = Number(req.query.month ?? now.getMonth() + 1);
    const year = Number(req.query.year ?? now.getFullYear());

    const cacheKey = `calendar:${lat.toFixed(2)}:${lng.toFixed(2)}:${method}:${school}:${year}-${month}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    try {
      const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
      const json = await fetchJsonWithTimeout<{ code: number; data: unknown[] }>(url, 10000);
      setCached(cacheKey, json.data, 1000 * 60 * 60 * 6);
      res.json(json.data);
    } catch (err) {
      res.status(502).json({
        error: "Unable to load monthly prayer calendar.",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });

  // 3. Hijri <-> Gregorian Date Conversion (Aladhan API)
  app.get("/api/calendar/convert", async (req, res) => {
    const mode = req.query.mode === "hToG" ? "hToG" : "gToH";
    const date = typeof req.query.date === "string" ? req.query.date : "";
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required (DD-MM-YYYY)" });
    }
    const cacheKey = `convert:${mode}:${date}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
      const endpoint = mode === "hToG" ? "hToG" : "gToH";
      const url = `https://api.aladhan.com/v1/${endpoint}/${encodeURIComponent(date)}`;
      const json = await fetchJsonWithTimeout<{ data: unknown }>(url, 8000);
      setCached(cacheKey, json.data, 1000 * 60 * 60 * 24);
      res.json(json.data);
    } catch (err) {
      res.status(502).json({
        error: "Unable to convert calendar date.",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });

  // 4. Quran Surah List (AlQuran Cloud API)
  app.get("/api/quran/surahs", async (_req, res) => {
    const cacheKey = "quran:surahs";
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
      const json = await fetchJsonWithTimeout<{ data: unknown[] }>(
        "https://api.alquran.cloud/v1/surah",
        10000
      );
      setCached(cacheKey, json.data, 1000 * 60 * 60 * 24);
      res.json(json.data);
    } catch (err) {
      res.status(502).json({
        error: "Unable to load Surah index.",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });

  // 5. Quran Surah Detail with Arabic, Sahih International, Pickthall, and Qari Audio
  app.get("/api/quran/surah/:number", async (req, res) => {
    const surahNumber = Number(req.params.number);
    const qari =
      req.query.qari === "ar.abdurrahmaansudais"
        ? "ar.abdurrahmaansudais"
        : req.query.qari === "ar.abdulbasitmurattal"
          ? "ar.abdulbasitmurattal"
          : "ar.alafasy";

    if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({ error: "Surah number must be between 1 and 114." });
    }

    const cacheKey = `quran:surah:${surahNumber}:${qari}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
      const editions = `quran-uthmani,en.sahih,en.pickthall,${qari}`;
      const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/${editions}`;
      const json = await fetchJsonWithTimeout<{
        data: Array<{
          number: number;
          name: string;
          englishName: string;
          englishNameTranslation: string;
          revelationType: string;
          numberOfAyahs: number;
          ayahs: Array<{
            number: number;
            numberInSurah: number;
            text: string;
            juz: number;
            page: number;
            audio?: string;
          }>;
        }>;
      }>(url, 15000);

      const [arabic, sahih, pickthall, audioEdition] = json.data;
      const merged = {
        number: arabic.number,
        name: arabic.name,
        englishName: arabic.englishName,
        englishNameTranslation: arabic.englishNameTranslation,
        revelationType: arabic.revelationType,
        numberOfAyahs: arabic.numberOfAyahs,
        qari,
        ayahs: arabic.ayahs.map((ayah, idx) => ({
          globalNumber: ayah.number,
          numberInSurah: ayah.numberInSurah,
          juz: ayah.juz,
          page: ayah.page,
          arabic: ayah.text,
          sahih: sahih?.ayahs[idx]?.text ?? "",
          pickthall: pickthall?.ayahs[idx]?.text ?? "",
          audioUrl:
            audioEdition?.ayahs[idx]?.audio ||
            `https://cdn.islamic.network/quran/audio/128/${qari}/${ayah.number}.mp3`,
        })),
      };

      setCached(cacheKey, merged, 1000 * 60 * 60 * 12);
      res.json(merged);
    } catch (err) {
      res.status(502).json({
        error: "Unable to load Surah verses.",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });

  // 6. Quran Global Search (Arabic or English)
  app.get("/api/quran/search", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const lang = req.query.lang === "ar" ? "quran-simple-clean" : "en.sahih";
    if (q.length < 2) {
      return res.json({ count: 0, matches: [] });
    }

    const cacheKey = `quran:search:${lang}:${q.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
      const url = `https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/${lang}`;
      const json = await fetchJsonWithTimeout<{
        data?: {
          count: number;
          matches: Array<{
            number: number;
            numberInSurah: number;
            text: string;
            surah: {
              number: number;
              name: string;
              englishName: string;
            };
          }>;
        };
      }>(url, 10000);

      const result = {
        count: json.data?.count ?? 0,
        matches: (json.data?.matches ?? []).slice(0, 30),
      };
      setCached(cacheKey, result, 1000 * 60 * 30);
      res.json(result);
    } catch {
      // AlQuran Cloud returns 404 when 0 matches are found
      res.json({ count: 0, matches: [] });
    }
  });

  // 7. Geocode City Search (OpenStreetMap Nominatim)
  app.get("/api/geocode", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q.length < 2) return res.json([]);

    const cacheKey = `geocode:${q.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`;
      const results = await fetchJsonWithTimeout<
        Array<{ display_name: string; lat: string; lon: string }>
      >(url, 7000);
      const formatted = results.map((item) => ({
        name: item.display_name.split(",").slice(0, 2).join(", "),
        fullName: item.display_name,
        lat: Number(item.lat),
        lng: Number(item.lon),
      }));
      setCached(cacheKey, formatted, 1000 * 60 * 60 * 6);
      res.json(formatted);
    } catch (err) {
      res.status(502).json({
        error: "Geocoding lookup failed.",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });

  // 8. Nearby Mosques & Halal Restaurants (OpenStreetMap Overpass API)
  app.get("/api/halal/nearby", async (req, res) => {
    const lat = Number(req.query.lat ?? 51.5074);
    const lng = Number(req.query.lng ?? -0.1278);
    const radius = Math.min(Number(req.query.radius ?? 5000), 15000);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    const cacheKey = `overpass:${lat.toFixed(3)}:${lng.toFixed(3)}:${radius}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const overpassQuery = `
[out:json][timeout:10];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
  node["diet:halal"="yes"](around:${radius},${lat},${lng});
  node["halal"="yes"](around:${radius},${lat},${lng});
  node["amenity"~"restaurant|cafe|fast_food"]["name"~"Halal|Zabihah|Biryani|Kebab|Shawarma|Turkish|Middle Eastern",i](around:${radius},${lat},${lng});
);
out center 35;
`.trim();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 11000);
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "DeenOS-App/1.0",
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Overpass HTTP ${response.status}`);
      }

      const json = (await response.json()) as {
        elements: Array<{
          id: number;
          type: string;
          lat?: number;
          lon?: number;
          center?: { lat: number; lon: number };
          tags?: Record<string, string>;
        }>;
      };

      const places = json.elements
        .map((el) => {
          const pLat = el.lat ?? el.center?.lat;
          const pLng = el.lon ?? el.center?.lon;
          if (pLat === undefined || pLng === undefined) return null;
          const tags = el.tags ?? {};
          const isMosque =
            tags.amenity === "place_of_worship" || tags.religion === "muslim";
          const name =
            tags.name ||
            tags["name:en"] ||
            (isMosque ? "Local Masjid" : "Halal Kitchen");
          const addressParts = [
            tags["addr:housenumber"],
            tags["addr:street"],
            tags["addr:city"],
          ].filter(Boolean);

          return {
            id: `${el.type}-${el.id}`,
            name,
            category: isMosque ? ("mosque" as const) : ("halal" as const),
            cuisine: tags.cuisine || (isMosque ? "Masjid & Prayer Hall" : "Halal Dining"),
            address: addressParts.join(" ") || tags["addr:full"] || "OpenStreetMap Verified Node",
            lat: pLat,
            lng: pLng,
            distanceKm: Number(haversineDistanceKm(lat, lng, pLat, pLng).toFixed(2)),
            bearingDeg: Math.round(bearingBetween(lat, lng, pLat, pLng)),
            openingHours: tags.opening_hours || null,
            phone: tags.phone || tags["contact:phone"] || null,
          };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 30);

      const payload = { source: "openstreetmap", places };
      setCached(cacheKey, payload, 1000 * 60 * 20);
      res.json(payload);
    } catch (err) {
      res.status(502).json({
        error: "Unable to query nearby places right now. Please try again in a moment.",
        detail: err instanceof Error ? err.message : "Timeout",
      });
    }
  });

  // 9. AI Islamic Knowledge Assistant (Server-Side Gemini API)
  app.post("/api/assistant/chat", async (req, res) => {
    if (!ai) {
      return res.status(503).json({
        error:
          "Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets.",
      });
    }

    const { message, history } = req.body as {
      message?: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const systemInstruction = `You are the DeenOS Islamic Knowledge Assistant, an educational companion specializing in foundational Fiqh (Islamic jurisprudence), Seerah (biography of Prophet Muhammad, peace be upon him), Quranic context, Hadith sciences, and daily spiritual etiquette.

Guidelines:
1. Ground answers in established classical Sunni scholarship and primary sources (Quran verses by Surah:Ayah, Sahih al-Bukhari, Sahih Muslim, or recognized madhhab positions such as Hanafi, Maliki, Shafi'i, and Hanbali where juristic differences exist).
2. Be respectful, clear, structured, and concise. Use numbered steps or short sections when explaining rulings or historical timelines.
3. Never issue personal legal verdicts (fatwa) on complex medical, marital, inheritance, or financial disputes.
4. Always conclude responses involving Fiqh rulings or personal guidance with a brief reminder to consult a qualified local scholar or imam for situation-specific rulings.`;

    try {
      const formattedHistory = (Array.isArray(history) ? history : [])
        .slice(-12)
        .map((item) => ({
          role: item.role === "assistant" ? ("model" as const) : ("user" as const),
          parts: [{ text: item.content }],
        }));

      const chat = ai.chats.create({
        model: "gemini-4-hydrogen",
        history: formattedHistory,
        config: {
          systemInstruction,
        },
      });

      const response = await chat.sendMessage({
        message: message.trim(),
      });

      res.json({
        reply: response.text ?? "I could not formulate a response. Please try again.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gemini request failed";
      const status = msg.includes("403") || msg.includes("API_KEY") ? 403 : 502;
      res.status(status).json({
        error: "Unable to process your question with the AI Islamic Assistant.",
        detail: msg,
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DeenOS server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error("Failed to start DeenOS server:", err);
  process.exit(1);
});
