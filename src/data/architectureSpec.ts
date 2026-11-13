export interface ArchNode {
  id: string;
  layer: "client" | "edge" | "services" | "external";
  title: string;
  subtitle: string;
  tech: string;
  details: string[];
}

export const ARCHITECTURE_NODES: ArchNode[] = [
  {
    id: "flutter-app",
    layer: "client",
    title: "DeenOS Mobile Client",
    subtitle: "Flutter 3.x (iOS & Android)",
    tech: "Riverpod · Drift SQLite · JustAudio · Flutter Compass",
    details: [
      "Feature-first Clean Architecture with offline-first Drift (SQLite) cache for full Quran text, Hadith corpus, and 30-day prayer schedules.",
      "Zero-jank 60/120fps custom Canvas painters for Qibla compass and Tasbih haptic ring.",
      "Background isolate scheduler (`workmanager` / `flutter_local_notifications`) for precise local Adhan alarms without battery drain.",
    ],
  },
  {
    id: "local-storage",
    layer: "client",
    title: "Encrypted Offline Store",
    subtitle: "Drift SQLite + Hive Box",
    tech: "FTS5 Arabic Search · SharedPrefs · Audio Cache",
    details: [
      "SQLite FTS5 virtual tables indexing 6,236 Quranic verses (Arabic without diacritics + Sahih/Pickthall) for sub-15ms offline search.",
      "LRU audio segment cache storing downloaded Surah recitations for flight/offline listening.",
    ],
  },
  {
    id: "api-gateway",
    layer: "edge",
    title: "Edge API & BFF Proxy",
    subtitle: "Cloud Functions / Node Edge",
    tech: "Express / Cloud Run · Redis Cache · Rate Limiter",
    details: [
      "Normalizes third-party upstream payloads (Aladhan, Quran.com v4, Metal Spot Prices) into compact Protobuf/JSON responses.",
      "Secures Gemini API keys and Google Maps Place keys strictly server-side; enforces per-user token budgets.",
    ],
  },
  {
    id: "firebase-backend",
    layer: "services",
    title: "Firebase / Supabase Core",
    subtitle: "Auth · Cloud Firestore / Postgres",
    tech: "Firebase Auth · Firestore Sync · FCM Push",
    details: [
      "Bidirectional offline-sync for Bookmarks, Last-Read Ayah position, Personal Tafsir Notes, and Tasbih Logs.",
      "Row-level security / Firestore Rules isolating user-owned collections by `request.auth.uid`.",
    ],
  },
  {
    id: "external-apis",
    layer: "external",
    title: "Domain & AI Providers",
    subtitle: "Aladhan · Quran.com · Maps · Gemini",
    tech: "REST + TLS 1.3 · Google GenAI SDK",
    details: [
      "Aladhan API: Astronomical Salah calculations (MWL, ISNA, Umm al-Qura) & Hijri calendar conversion.",
      "Quran.com v4 / AlQuran Cloud: Uthmani script, word-level audio timestamps, Qari streams.",
      "Google Maps Places API / MapKit: Verified Halal dining & Masjid geofencing.",
      "Gemini API (`gemini-4-hydrogen`): Grounded Fiqh & Seerah educational Q&A with scholarly guardrails.",
    ],
  },
];

export const FOLDER_STRUCTURE = `deenos/
├── mobile/                                 # Flutter 3.x Cross-Platform Client
│   ├── lib/
│   │   ├── main.dart                       # Bootstrap, Firebase/Supabase init, Error boundary
│   │   ├── app/
│   │   │   ├── router.dart                 # GoRouter declarative navigation & deep links
│   │   │   ├── theme/
│   │   │   │   ├── deenos_colors.dart      # Emerald #065F46 & Burnished Gold #C69749 tokens
│   │   │   │   ├── deenos_typography.dart  # Plus Jakarta Sans + Amiri/Noto Naskh Arabic
│   │   │   │   └── deenos_theme.dart       # Light (Alabaster) & Dark (Obsidian Emerald) themes
│   │   │   └── di/providers.dart           # Riverpod global providers
│   │   ├── core/
│   │   │   ├── database/
│   │   │   │   ├── app_database.dart       # Drift SQLite schema + FTS5 Quran search
│   │   │   │   └── sync_engine.dart        # Conflict-free Last-Write-Wins Firestore sync
│   │   │   ├── network/api_client.dart     # Dio client with ETag caching & retry interceptor
│   │   │   └── services/
│   │   │       ├── adhan_scheduler.dart    # Local exact-alarm Adhan & voice notification engine
│   │   │       ├── sensor_compass.dart     # Magnetometer + Accelerometer tilt-compensated Qibla
│   │   │       └── audio_handler.dart      # Background lock-screen audio service
│   │   └── features/
│   │       ├── prayer_qibla/               # GPS timings, methods, Qibla dial, monthly grid
│   │       ├── quran/                      # Surah reader, ayah audio sync, bookmarks, notes
│   │       ├── tasbih/                     # Haptic bead counter, presets, session analytics
│   │       ├── hadith_duas/                # Bukhari/Muslim corpus, Dua of the Day, categories
│   │       ├── calendar/                   # Hijri converter & Islamic milestone countdowns
│   │       ├── zakat/                      # Multi-asset calculator + live Nisab thresholds
│   │       ├── halal_finder/               # Google Maps / MapKit mosques & halal restaurants
│   │       └── ai_assistant/               # Grounded Fiqh & Seerah chat with scholar disclaimer
│   └── pubspec.yaml
├── backend/                                # BFF Proxy & Cloud Functions
│   ├── src/
│   │   ├── routes/
│   │   │   ├── prayer.ts                   # Aladhan proxy + 30-min edge cache + Qibla math
│   │   │   ├── quran.ts                    # Quran.com / AlQuran Cloud aggregator
│   │   │   ├── halal.ts                    # Places API / Overpass proxy + distance sorting
│   │   │   ├── zakat.ts                    # Live Gold/Silver spot Nisab feed
│   │   │   └── assistant.ts                # @google/genai server-side chat endpoint
│   │   ├── middleware/auth.ts              # Firebase ID token verification & rate limit
│   │   └── server.ts                       # Express + Vite / Cloud Run entrypoint
│   └── firestore.rules                     # Strict UID-scoped security rules
└── docs/
    ├── ARCHITECTURE.md
    └── SCHEMA.sql                          # PostgreSQL / Supabase relational migration`;

export const DESIGN_TOKENS = {
  colors: [
    { name: "Alabaster Canvas (Light)", hex: "#FAFAF7", role: "60% Dominant Background", contrast: "16.4:1 with Ink" },
    { name: "Obsidian Emerald (Dark)", hex: "#0A110E", role: "60% Dark Mode Canvas", contrast: "15.8:1 with Ivory" },
    { name: "Botanical Emerald", hex: "#065F46", role: "10% Primary CTA & Active States", contrast: "7.8:1 with White" },
    { name: "Radiant Emerald", hex: "#10B981", role: "Dark Mode Active & Live Indicator", contrast: "6.4:1 on #0A110E" },
    { name: "Burnished Gold", hex: "#B8860B", role: "Qibla Axis, Ayah Ornaments, Nisab", contrast: "4.6:1 on Alabaster" },
    { name: "Antique Gold (Dark)", hex: "#D4AF37", role: "Dark Mode Gold Highlights", contrast: "9.2:1 on #0A110E" },
    { name: "Pure Paper Surface", hex: "#FFFFFF", role: "30% Structural Card Surface", contrast: "1px #E5E7E2 border" },
    { name: "Deep Pine Surface", hex: "#111C17", role: "30% Dark Structural Surface", contrast: "1px #1D2E26 border" },
  ],
  typography: [
    {
      role: "Display & UI Sans (English)",
      family: "Plus Jakarta Sans",
      weights: "400 Regular · 500 Medium · 600 SemiBold · 700 Bold",
      sample: "Al-Mulk · Precision Prayer & Knowledge",
    },
    {
      role: "Sacred Script (Traditional Naskh Arabic)",
      family: "Noto Naskh Arabic / Amiri",
      weights: "400 Regular · 700 Bold (Line height 2.1, full Tashkeel)",
      sample: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      isArabic: true,
    },
    {
      role: "Timestamps, Coordinates & Financial",
      family: "JetBrains Mono (tabular-nums)",
      weights: "400 Regular · 500 Medium",
      sample: "05:14 AM  ·  QIBLA 118.9° ESE  ·  $1,425.00",
      isMono: true,
    },
  ],
};

export const SQL_SCHEMA = `-- DeenOS Relational Database Schema (PostgreSQL / Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Preferences
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_uid TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT UNIQUE,
  preferred_madhhab TEXT DEFAULT 'standard' CHECK (preferred_madhhab IN ('standard', 'hanafi')),
  calculation_method INT NOT NULL DEFAULT 2, -- 2=ISNA, 3=MWL, 4=UmmAlQura, 5=Egyptian
  adhan_voice TEXT NOT NULL DEFAULT 'mishary',
  preferred_qari TEXT NOT NULL DEFAULT 'ar.alafasy',
  preferred_translation TEXT NOT NULL DEFAULT 'en.sahih',
  last_latitude DOUBLE PRECISION,
  last_longitude DOUBLE PRECISION,
  last_city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Quran Bookmarks & Last-Read Progress
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  surah_number SMALLINT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  ayah_number SMALLINT NOT NULL CHECK (ayah_number >= 1),
  bookmark_type TEXT NOT NULL DEFAULT 'saved' CHECK (bookmark_type IN ('saved', 'last_read')),
  note_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, surah_number, ayah_number, bookmark_type)
);

-- 3. Digital Tasbih & Dhikr Session Logs
CREATE TABLE tasbih_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dhikr_key TEXT NOT NULL,
  dhikr_arabic TEXT NOT NULL,
  count_completed INT NOT NULL CHECK (count_completed > 0),
  target_count INT NOT NULL DEFAULT 33,
  duration_seconds INT DEFAULT 0,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Zakat Annual Snapshots (Encrypted / Private)
CREATE TABLE zakat_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hijri_year SMALLINT NOT NULL,
  nisab_standard TEXT NOT NULL CHECK (nisab_standard IN ('gold', 'silver')),
  net_zakatable_wealth NUMERIC(14, 2) NOT NULL,
  zakat_due NUMERIC(14, 2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id, created_at DESC);
CREATE INDEX idx_tasbih_user_date ON tasbih_logs(user_id, logged_at DESC);`;

export const FIRESTORE_SCHEMA = `// Cloud Firestore NoSQL Document Hierarchy & Security Rules

// Collection: /users/{uid}
{
  "displayName": "Hamza A.",
  "calculationMethod": 2,
  "hanafiAsr": false,
  "adhanVoice": "mishary",
  "qari": "ar.alafasy",
  "lastRead": { "surah": 18, "ayah": 10, "updatedAt": "2026-11-13T08:30:00Z" }
}

// Subcollection: /users/{uid}/bookmarks/{surah}_{ayah}
{
  "surahNumber": 18,
  "surahName": "Al-Kahf",
  "ayahNumber": 10,
  "note": "Dua of the youths of the cave for mercy and guidance.",
  "createdAt": "2026-11-13T08:32:00Z"
}

// Subcollection: /users/{uid}/tasbihLogs/{logId}
{
  "phrase": "SubhanAllah",
  "arabic": "سُبْحَانَ اللَّهِ",
  "count": 33,
  "target": 33,
  "completedAt": "2026-11-13T08:40:00Z"
}

// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{subcollection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`;

export const IMPLEMENTATION_ROADMAP = [
  {
    phase: "Phase 1 · Weeks 1–3",
    title: "Foundation & Core Worship MVP",
    status: "Core Priority",
    deliverables: [
      "Flutter project scaffolding, Emerald/Gold theme tokens, and Riverpod + Drift SQLite setup.",
      "GPS & manual city Prayer Times engine (Aladhan API + local Adhan calculation fallback).",
      "Sensor-driven Qibla compass with calibration UI and local exact-alarm Adhan notifications.",
      "Offline-ready Digital Tasbih counter with haptic feedback and local session history.",
    ],
  },
  {
    phase: "Phase 2 · Weeks 4–6",
    title: "The Holy Quran & Audio Sync Engine",
    status: "Content Depth",
    deliverables: [
      "114 Surah Uthmani Arabic reader with Sahih International & Pickthall translations.",
      "Background Qari audio streaming (Mishary Alafasy, Sudais) with verse-level highlighting & auto-scroll.",
      "SQLite FTS5 Arabic/English full-text search, bookmarks, last-read resume banner, and personal notes.",
    ],
  },
  {
    phase: "Phase 3 · Weeks 7–9",
    title: "Hadith, Hijri Calendar, Zakat & Halal Map",
    status: "Daily Utility",
    deliverables: [
      "Curated Hadith browser (Bukhari, Muslim) + Dua of the Day & categorized supplications.",
      "Bidirectional Hijri/Gregorian converter and live Ramadan/Eid/Ashura countdowns.",
      "Zakat Calculator with live Gold/Silver spot prices and dual Nisab threshold engine.",
      "Google Maps / MapKit Halal Finder with mosque & zabihah filtering and turn-by-turn deep links.",
    ],
  },
  {
    phase: "Phase 4 · Weeks 10–12",
    title: "Cloud Sync, AI Islamic Assistant & Launch Polish",
    status: "Scale & Intelligence",
    deliverables: [
      "Firebase Auth + Firestore bidirectional sync for bookmarks, notes, and Tasbih streaks.",
      "Server-side Gemini AI Islamic Assistant for Fiqh & Seerah Q&A with citation discipline & scholar disclaimer.",
      "Home-screen iOS WidgetKit & Android Glance prayer widgets + Accessibility & RTL Arabic audit.",
    ],
  },
];
