import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  Calendar as CalendarIcon,
  Compass,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { ADHAN_VOICES, CALCULATION_METHODS } from "../data/islamicContent";
import {
  LocationState,
  MonthlyPrayerDay,
  PrayerTimingsResponse,
} from "../types/deenos";
import { playAdhanPreviewTone } from "../utils/audio";

interface PrayerQiblaViewProps {
  location: LocationState;
  onOpenLocation: () => void;
}

const HERO_IMAGE_URL = "/src/assets/images/islamic_courtyard_hero_1794589122517.jpg";

function parseTimeToMinutes(timeStr: string): number {
  const clean = timeStr.split(" ")[0];
  const [h, m] = clean.split(":").map(Number);
  return h * 60 + m;
}

function formatCleanTime(timeStr: string): string {
  return timeStr.split(" ")[0];
}

export function PrayerQiblaView({ location, onOpenLocation }: PrayerQiblaViewProps) {
  const [method, setMethod] = useState<number>(() => {
    const saved = localStorage.getItem("deenos_calc_method");
    return saved ? Number(saved) : 2;
  });
  const [hanafiAsr, setHanafiAsr] = useState<boolean>(() => {
    return localStorage.getItem("deenos_hanafi_asr") === "true";
  });
  const [adhanVoice, setAdhanVoice] = useState<string>(() => {
    return localStorage.getItem("deenos_adhan_voice") || "mishary";
  });
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("deenos_prayer_notifs");
      return saved
        ? JSON.parse(saved)
        : { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true };
    } catch {
      return { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true };
    }
  });

  const [timingsData, setTimingsData] = useState<PrayerTimingsResponse | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyPrayerDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Qibla sensor & calibration state
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [sensorActive, setSensorActive] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [nowMinutes, setNowMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    }, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    localStorage.setItem("deenos_calc_method", String(method));
  }, [method]);

  useEffect(() => {
    localStorage.setItem("deenos_hanafi_asr", String(hanafiAsr));
  }, [hanafiAsr]);

  useEffect(() => {
    localStorage.setItem("deenos_adhan_voice", adhanVoice);
  }, [adhanVoice]);

  useEffect(() => {
    localStorage.setItem("deenos_prayer_notifs", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      const school = hanafiAsr ? 1 : 0;
      try {
        const [todayRes, monthRes] = await Promise.all([
          fetch(
            `/api/prayer/timings?lat=${location.lat}&lng=${location.lng}&method=${method}&school=${school}`
          ),
          fetch(
            `/api/prayer/calendar?lat=${location.lat}&lng=${location.lng}&method=${method}&school=${school}`
          ),
        ]);
        if (!todayRes.ok) throw new Error("Unable to load today's prayer schedule.");
        const todayJson = (await todayRes.json()) as PrayerTimingsResponse;
        const monthJson = monthRes.ok ? ((await monthRes.json()) as MonthlyPrayerDay[]) : [];
        if (!cancelled) {
          setTimingsData(todayJson);
          setMonthlyData(Array.isArray(monthJson) ? monthJson : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load prayer times.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [location.lat, location.lng, method, hanafiAsr]);

  async function enableDeviceCompass() {
    if (typeof window === "undefined") return;
    const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (DeviceOrientation && typeof DeviceOrientation.requestPermission === "function") {
      try {
        const perm = await DeviceOrientation.requestPermission();
        if (perm !== "granted") {
          setShowCalibration(true);
          return;
        }
      } catch {
        setShowCalibration(true);
        return;
      }
    }

    const handler = (event: DeviceOrientationEvent) => {
      const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number })
        .webkitCompassHeading;
      if (typeof webkitHeading === "number") {
        setDeviceHeading(Math.round(webkitHeading));
      } else if (typeof event.alpha === "number") {
        setDeviceHeading(Math.round((360 - event.alpha) % 360));
      }
    };

    window.addEventListener("deviceorientation", handler, true);
    setSensorActive(true);
  }

  const prayerList = useMemo(() => {
    if (!timingsData) return [];
    const t = timingsData.timings;
    return [
      { key: "Fajr", arabic: "الفجر", time: formatCleanTime(t.Fajr), notifyable: true },
      { key: "Sunrise", arabic: "الشروق", time: formatCleanTime(t.Sunrise), notifyable: false },
      { key: "Dhuhr", arabic: "الظهر", time: formatCleanTime(t.Dhuhr), notifyable: true },
      { key: "Asr", arabic: "العصر", time: formatCleanTime(t.Asr), notifyable: true },
      { key: "Maghrib", arabic: "المغرب", time: formatCleanTime(t.Maghrib), notifyable: true },
      { key: "Isha", arabic: "العشاء", time: formatCleanTime(t.Isha), notifyable: true },
    ];
  }, [timingsData]);

  const nextPrayerInfo = useMemo(() => {
    const fard = prayerList.filter((p) => p.notifyable);
    if (fard.length === 0) return null;
    for (const p of fard) {
      const mins = parseTimeToMinutes(p.time);
      if (mins > nowMinutes) {
        const diff = mins - nowMinutes;
        const hrs = Math.floor(diff / 60);
        const rem = diff % 60;
        return {
          ...p,
          countdown: hrs > 0 ? `${hrs}h ${rem}m` : `${rem}m`,
        };
      }
    }
    const fajrMins = parseTimeToMinutes(fard[0].time) + 24 * 60;
    const diff = fajrMins - nowMinutes;
    return {
      ...fard[0],
      countdown: `${Math.floor(diff / 60)}h ${diff % 60}m`,
    };
  }, [prayerList, nowMinutes]);

  const activeHeading = sensorActive && deviceHeading !== null ? deviceHeading : manualHeading;
  const qiblaBearing = timingsData?.qiblaBearing ?? 118.9;
  const relativeQiblaRotation = (qiblaBearing - activeHeading + 360) % 360;
  const isAligned = relativeQiblaRotation <= 5 || relativeQiblaRotation >= 355;

  return (
    <div className="space-y-8">
      {/* Hero Split: Architectural Courtyard + Live Next Salah Anchor */}
      <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-xl border border-[#E5E7E2] bg-[#064E3B] lg:col-span-7 dark:border-[#1D2E26]">
          <img
            src={HERO_IMAGE_URL}
            alt="Serene Islamic architectural courtyard at dawn"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#052E22]/90 via-[#052E22]/55 to-[#052E22]/30"
          />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-6 sm:p-8">
            <div className="text-xs font-medium text-white/90">
              <span>{location.city}, {location.country}</span>
              <span aria-hidden="true" className="mx-2 opacity-60">·</span>
              <span className="font-mono-tabular">
                {location.lat.toFixed(2)}°, {location.lng.toFixed(2)}°
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenLocation}
              className="text-xs font-semibold text-[#FDE68A] underline-offset-4 hover:underline"
            >
              Change location
            </button>
          </div>

          <div className="relative z-10 p-6 sm:p-8">
            {loading && !timingsData ? (
              <div className="space-y-3">
                <div className="h-4 w-36 rounded bg-white/20" />
                <div className="h-10 w-64 rounded bg-white/20" />
              </div>
            ) : error ? (
              <div className="text-sm text-amber-200">{error}</div>
            ) : (
              <>
                <div className="text-xs font-medium text-[#FDE68A]">
                  <span>
                    {timingsData?.date.hijri.day} {timingsData?.date.hijri.month.en}{" "}
                    {timingsData?.date.hijri.year} AH
                  </span>
                  <span aria-hidden="true" className="mx-2 opacity-60">·</span>
                  <span className="font-arabic text-sm">
                    {timingsData?.date.hijri.month.ar}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      {nextPrayerInfo ? `${nextPrayerInfo.key} in ${nextPrayerInfo.countdown}` : "Daily Prayer Times"}
                    </h1>
                    <p className="mt-1 text-sm text-white/80">
                      {timingsData?.date.readable}
                      {nextPrayerInfo && (
                        <>
                          <span aria-hidden="true" className="mx-2 opacity-60">·</span>
                          <span className="font-mono-tabular">
                            Starts at {nextPrayerInfo.time}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {nextPrayerInfo && (
                    <div className="text-right">
                      <span className="font-arabic text-3xl text-[#FDE68A]">
                        {nextPrayerInfo.arabic}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Qibla Compass Card */}
        <div className="flex flex-col justify-between rounded-xl border border-[#E5E7E2] bg-white p-6 lg:col-span-5 dark:border-[#1D2E26] dark:bg-[#111C17]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
                Qibla Compass
              </h2>
              <p className="mt-0.5 text-xs text-[#526058] dark:text-[#98A89E]">
                Bearing{" "}
                <span className="font-mono-tabular font-semibold text-[#065F46] dark:text-[#10B981]">
                  {qiblaBearing.toFixed(1)}°
                </span>{" "}
                <span aria-hidden="true">·</span>{" "}
                <span className="font-mono-tabular">
                  {timingsData?.distanceToMakkahKm?.toLocaleString() ?? "—"} km
                </span>{" "}
                to Makkah
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCalibration((v) => !v)}
              className="text-xs font-medium text-[#065F46] hover:underline dark:text-[#10B981]"
            >
              {showCalibration ? "Hide Guide" : "Calibration"}
            </button>
          </div>

          {/* Interactive SVG Qibla Dial */}
          <div className="my-4 flex flex-col items-center justify-center">
            <div className="relative flex h-48 w-48 items-center justify-center">
              <svg viewBox="0 0 200 200" className="h-full w-full">
                {/* Outer Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[#E5E7E2] dark:text-[#1D2E26]"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="76"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="2 6"
                  strokeWidth="1"
                  className="text-[#CBD5CE] dark:text-[#2A4035]"
                />
                {/* Rotating Compass Card */}
                <g transform={`rotate(${-activeHeading} 100 100)`}>
                  <text
                    x="100"
                    y="24"
                    textAnchor="middle"
                    className="fill-[#B8860B] text-[11px] font-bold dark:fill-[#D4AF37]"
                  >
                    N
                  </text>
                  <text
                    x="178"
                    y="104"
                    textAnchor="middle"
                    className="fill-[#6B7A71] text-[10px] font-semibold"
                  >
                    E
                  </text>
                  <text
                    x="100"
                    y="184"
                    textAnchor="middle"
                    className="fill-[#6B7A71] text-[10px] font-semibold"
                  >
                    S
                  </text>
                  <text
                    x="22"
                    y="104"
                    textAnchor="middle"
                    className="fill-[#6B7A71] text-[10px] font-semibold"
                  >
                    W
                  </text>
                </g>

                {/* Qibla Vector Needle */}
                <g transform={`rotate(${relativeQiblaRotation} 100 100)`}>
                  <polygon
                    points="100,26 107,100 100,92 93,100"
                    fill={isAligned ? "#10B981" : "#B8860B"}
                  />
                  <polygon
                    points="100,174 105,100 100,108 95,100"
                    fill="#94A3B8"
                    opacity="0.45"
                  />
                  {/* Kaaba icon node at tip */}
                  <rect
                    x="94"
                    y="17"
                    width="12"
                    height="12"
                    rx="2"
                    fill="#111815"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                  />
                </g>

                <circle
                  cx="100"
                  cy="100"
                  r="6"
                  fill="#065F46"
                  stroke="#D4AF37"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="mt-1 text-center">
              <span
                className={`text-xs font-semibold ${
                  isAligned
                    ? "text-[#065F46] dark:text-[#10B981]"
                    : "text-[#526058] dark:text-[#98A89E]"
                }`}
              >
                {isAligned
                  ? "Aligned with Qibla"
                  : `Rotate ${Math.round(relativeQiblaRotation)}° clockwise to face Kaaba`}
              </span>
            </div>
          </div>

          {showCalibration ? (
            <div className="rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] p-3 text-xs text-[#526058] dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#98A89E]">
              <p className="font-semibold text-[#111815] dark:text-[#EEF2EF]">
                Figure-8 Magnetometer Calibration
              </p>
              <p className="mt-1 leading-relaxed">
                Move your device smoothly in a figure-8 motion away from magnetic cases or speakers. On desktop browsers without a magnetometer, adjust the manual heading dial below.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 border-t border-[#E5E7E2] pt-3 dark:border-[#1D2E26]">
              <div className="flex items-center justify-between gap-2 text-xs">
                <label htmlFor="heading-slider" className="text-[#526058] dark:text-[#98A89E]">
                  Simulated Heading:{" "}
                  <span className="font-mono-tabular font-semibold text-[#111815] dark:text-[#EEF2EF]">
                    {activeHeading}°
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSensorActive(false);
                      setManualHeading(0);
                    }}
                    aria-label="Reset heading to North"
                    className="inline-flex items-center gap-1 text-xs text-[#526058] hover:text-[#111815] dark:text-[#98A89E]"
                  >
                    <RotateCcw className="h-3 w-3" />
                    North
                  </button>
                  <button
                    type="button"
                    onClick={enableDeviceCompass}
                    className="inline-flex items-center gap-1 rounded-md border border-[#E5E7E2] px-2.5 py-1 text-xs font-medium text-[#111815] hover:border-[#065F46] dark:border-[#1D2E26] dark:text-[#EEF2EF]"
                  >
                    <Compass className="h-3 w-3 text-[#065F46] dark:text-[#10B981]" />
                    {sensorActive ? "Sensor Live" : "Use Sensor"}
                  </button>
                </div>
              </div>
              <input
                id="heading-slider"
                type="range"
                min={0}
                max={359}
                value={activeHeading}
                onChange={(e) => {
                  setSensorActive(false);
                  setManualHeading(Number(e.target.value));
                }}
                className="h-1.5 w-full cursor-pointer accent-[#065F46]"
              />
            </div>
          )}
        </div>
      </section>

      {/* Prayer Schedule Row (Full-width 6-column KPI strip below hero split) */}
      <section aria-label="Daily Salah Schedule">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#111815] dark:text-[#EEF2EF]">
              Daily Prayer Schedule
            </h2>
            <p className="text-xs text-[#526058] dark:text-[#98A89E]">
              {timingsData?.meta.method.name ?? "Astronomical calculation"} ·{" "}
              {hanafiAsr ? "Hanafi Asr" : "Standard Shafi/Maliki/Hanbali Asr"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCalendar((v) => !v)}
            className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-[#E5E7E2] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#111815] transition-colors hover:border-[#065F46] dark:border-[#1D2E26] dark:bg-[#111C17] dark:text-[#EEF2EF]"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-[#065F46] dark:text-[#10B981]" />
            <span>{showCalendar ? "Hide Monthly Calendar" : "Monthly Prayer Calendar"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {prayerList.map((prayer) => {
            const isNext = nextPrayerInfo?.key === prayer.key;
            const isEnabled = notifications[prayer.key] ?? false;
            return (
              <div
                key={prayer.key}
                className={`flex flex-col justify-between rounded-xl border p-4 transition-colors ${
                  isNext
                    ? "border-[#065F46] bg-[#065F46] text-white dark:border-[#10B981] dark:bg-[#064E3B]"
                    : "border-[#E5E7E2] bg-white text-[#111815] dark:border-[#1D2E26] dark:bg-[#111C17] dark:text-[#EEF2EF]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        isNext ? "text-[#FDE68A]" : "text-[#526058] dark:text-[#98A89E]"
                      }`}
                    >
                      {prayer.key}
                    </p>
                    <p
                      className={`font-arabic text-base ${
                        isNext ? "text-white/90" : "text-[#111815] dark:text-[#EEF2EF]"
                      }`}
                    >
                      {prayer.arabic}
                    </p>
                  </div>
                  {prayer.notifyable && (
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [prayer.key]: !prev[prayer.key],
                        }))
                      }
                      aria-label={`Toggle Adhan alert for ${prayer.key}`}
                      className={`rounded-md p-1.5 transition-colors ${
                        isNext
                          ? "hover:bg-white/10"
                          : "hover:bg-[#FAFAF7] dark:hover:bg-[#192821]"
                      }`}
                    >
                      {isEnabled ? (
                        <Bell
                          className={`h-3.5 w-3.5 ${
                            isNext ? "text-[#FDE68A]" : "text-[#065F46] dark:text-[#10B981]"
                          }`}
                        />
                      ) : (
                        <BellOff className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  )}
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-mono-tabular text-2xl font-bold tracking-tight">
                    {prayer.time}
                  </span>
                  {isNext && (
                    <span className="text-[11px] font-medium text-[#FDE68A]">
                      Next
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Calculation Method & Adhan Voice Controls */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E5E7E2] bg-white p-6 dark:border-[#1D2E26] dark:bg-[#111C17]">
          <h3 className="text-sm font-semibold text-[#111815] dark:text-[#EEF2EF]">
            Calculation Method & Juristic School
          </h3>
          <p className="mt-0.5 text-xs text-[#526058] dark:text-[#98A89E]">
            Configure Fajr/Isha twilight angles and Asr shadow ratio.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="calc-method"
                className="mb-1.5 block text-xs font-medium text-[#526058] dark:text-[#98A89E]"
              >
                Authority Convention
              </label>
              <select
                id="calc-method"
                value={method}
                onChange={(e) => setMethod(Number(e.target.value))}
                className="h-10 w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-3 text-sm text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
              >
                {CALCULATION_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} (Fajr {m.fajrAngle} / Isha {m.ishaAngle})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between border-t border-[#E5E7E2] pt-4 dark:border-[#1D2E26]">
              <div>
                <p className="text-sm font-medium text-[#111815] dark:text-[#EEF2EF]">
                  Asr Juristic Method
                </p>
                <p className="text-xs text-[#526058] dark:text-[#98A89E]">
                  Standard (1x shadow) vs Hanafi (2x shadow)
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-[#FAFAF7] p-1 dark:bg-[#0A110E]">
                <button
                  type="button"
                  onClick={() => setHanafiAsr(false)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    !hanafiAsr
                      ? "bg-white text-[#065F46] shadow-xs dark:bg-[#111C17] dark:text-[#10B981]"
                      : "text-[#526058] dark:text-[#98A89E]"
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setHanafiAsr(true)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    hanafiAsr
                      ? "bg-white text-[#065F46] shadow-xs dark:bg-[#111C17] dark:text-[#10B981]"
                      : "text-[#526058] dark:text-[#98A89E]"
                  }`}
                >
                  Hanafi
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7E2] bg-white p-6 dark:border-[#1D2E26] dark:bg-[#111C17]">
          <h3 className="text-sm font-semibold text-[#111815] dark:text-[#EEF2EF]">
            Adhan Muezzin Voice
          </h3>
          <p className="mt-0.5 text-xs text-[#526058] dark:text-[#98A89E]">
            Select the vocal style for prayer notifications and preview the Maqam chime.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ADHAN_VOICES.map((voice) => {
              const selected = adhanVoice === voice.id;
              return (
                <div
                  key={voice.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors ${
                    selected
                      ? "border-[#065F46] bg-[#065F46]/5 dark:border-[#10B981] dark:bg-[#10B981]/10"
                      : "border-[#E5E7E2] dark:border-[#1D2E26]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setAdhanVoice(voice.id)}
                    className="flex-1 text-left"
                  >
                    <p
                      className={`text-xs font-semibold ${
                        selected
                          ? "text-[#065F46] dark:text-[#10B981]"
                          : "text-[#111815] dark:text-[#EEF2EF]"
                      }`}
                    >
                      {voice.name}
                    </p>
                    <p className="text-[11px] text-[#526058] dark:text-[#98A89E]">
                      {voice.origin} · {voice.style}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdhanVoice(voice.id);
                      playAdhanPreviewTone(voice.id);
                    }}
                    aria-label={`Preview ${voice.name}`}
                    className="ml-2 rounded-md p-1.5 text-[#526058] hover:bg-[#FAFAF7] hover:text-[#065F46] dark:text-[#98A89E] dark:hover:bg-[#192821] dark:hover:text-[#10B981]"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Monthly Prayer Calendar Table */}
      {showCalendar && (
        <section className="overflow-hidden rounded-xl border border-[#E5E7E2] bg-white dark:border-[#1D2E26] dark:bg-[#111C17]">
          <div className="border-b border-[#E5E7E2] px-6 py-4 dark:border-[#1D2E26]">
            <h3 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
              Monthly Prayer Calendar · {location.city}
            </h3>
            <p className="text-xs text-[#526058] dark:text-[#98A89E]">
              Complete daily Gregorian and Hijri timetable for the current month.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E5E7E2] bg-[#FAFAF7] text-[#526058] dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#98A89E]">
                <tr>
                  <th className="px-4 py-3 font-medium">Gregorian</th>
                  <th className="px-4 py-3 font-medium">Hijri</th>
                  <th className="px-4 py-3 text-right font-medium">Fajr</th>
                  <th className="px-4 py-3 text-right font-medium">Sunrise</th>
                  <th className="px-4 py-3 text-right font-medium">Dhuhr</th>
                  <th className="px-4 py-3 text-right font-medium">Asr</th>
                  <th className="px-4 py-3 text-right font-medium">Maghrib</th>
                  <th className="px-4 py-3 text-right font-medium">Isha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7E2] dark:divide-[#1D2E26]">
                {monthlyData.map((day, idx) => {
                  const isToday =
                    Number(day.date.gregorian.day) === new Date().getDate();
                  return (
                    <tr
                      key={idx}
                      className={
                        isToday
                          ? "bg-[#065F46]/8 font-semibold text-[#065F46] dark:bg-[#10B981]/10 dark:text-[#10B981]"
                          : "hover:bg-[#FAFAF7] dark:hover:bg-[#192821]/50"
                      }
                    >
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {day.date.gregorian.weekday.en.slice(0, 3)}, {day.date.gregorian.day}{" "}
                        {day.date.gregorian.month.en.slice(0, 3)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-[#526058] dark:text-[#98A89E]">
                        {day.date.hijri.day} {day.date.hijri.month.en} {day.date.hijri.year}
                      </td>
                      <td className="font-mono-tabular px-4 py-2.5 text-right">
                        {formatCleanTime(day.timings.Fajr)}
                      </td>
                      <td className="font-mono-tabular px-4 py-2.5 text-right text-[#6B7A71]">
                        {formatCleanTime(day.timings.Sunrise)}
                      </td>
                      <td className="font-mono-tabular px-4 py-2.5 text-right">
                        {formatCleanTime(day.timings.Dhuhr)}
                      </td>
                      <td className="font-mono-tabular px-4 py-2.5 text-right">
                        {formatCleanTime(day.timings.Asr)}
                      </td>
                      <td className="font-mono-tabular px-4 py-2.5 text-right">
                        {formatCleanTime(day.timings.Maghrib)}
                      </td>
                      <td className="font-mono-tabular px-4 py-2.5 text-right">
                        {formatCleanTime(day.timings.Isha)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
