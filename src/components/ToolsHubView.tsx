import { useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  Calculator,
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  MapPin,
  Navigation,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import {
  DHIKR_PHRASES,
  DUA_COLLECTION,
  HADITH_COLLECTION,
  ISLAMIC_MILESTONES,
} from "../data/islamicContent";
import {
  HalalPlace,
  LocationState,
  TasbihLog,
  ToolSubTab,
} from "../types/deenos";
import { playTasbihClick, triggerHaptic } from "../utils/audio";

interface ToolsHubViewProps {
  location: LocationState;
  onOpenLocation: () => void;
}

export function ToolsHubView({ location, onOpenLocation }: ToolsHubViewProps) {
  const [subTab, setSubTab] = useState<ToolSubTab>("tasbih");

  // 1. Tasbih State
  const [selectedPhraseId, setSelectedPhraseId] = useState(DHIKR_PHRASES[0].id);
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTarget] = useState(33);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tasbihLogs, setTasbihLogs] = useState<TasbihLog[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("deenos_tasbih_logs") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("deenos_tasbih_logs", JSON.stringify(tasbihLogs));
  }, [tasbihLogs]);

  const activePhrase =
    DHIKR_PHRASES.find((p) => p.id === selectedPhraseId) ?? DHIKR_PHRASES[0];

  function handleTasbihTap() {
    const next = tasbihCount + 1;
    const hitTarget = next === tasbihTarget;
    setTasbihCount(next);
    triggerHaptic(hitTarget ? 45 : 15);
    if (soundEnabled) {
      playTasbihClick(hitTarget);
    }
  }

  function handleSaveTasbihSession() {
    if (tasbihCount === 0) return;
    const newLog: TasbihLog = {
      id: String(Date.now()),
      phrase: activePhrase.phrase,
      arabic: activePhrase.arabic,
      count: tasbihCount,
      target: tasbihTarget,
      completedAt: new Date().toISOString(),
    };
    setTasbihLogs((prev) => [newLog, ...prev].slice(0, 50));
    setTasbihCount(0);
  }

  const totalTasbihLogged = useMemo(
    () => tasbihLogs.reduce((acc, log) => acc + log.count, 0),
    [tasbihLogs]
  );

  // 2. Hadith & Duas State
  const [hadithFilter, setHadithFilter] = useState<string>("All");
  const [hadithQuery, setHadithQuery] = useState("");
  const [duaCategory, setDuaCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const duaOfTheDay = useMemo(() => {
    const dayIndex = new Date().getDate() % DUA_COLLECTION.length;
    return DUA_COLLECTION[dayIndex];
  }, []);

  const filteredHadiths = useMemo(() => {
    return HADITH_COLLECTION.filter((h) => {
      const matchesCol = hadithFilter === "All" || h.collection === hadithFilter;
      const q = hadithQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        h.english.toLowerCase().includes(q) ||
        h.topic.toLowerCase().includes(q) ||
        h.narrator.toLowerCase().includes(q);
      return matchesCol && matchesQuery;
    });
  }, [hadithFilter, hadithQuery]);

  const filteredDuas = useMemo(() => {
    return DUA_COLLECTION.filter(
      (d) => duaCategory === "All" || d.category === duaCategory
    );
  }, [duaCategory]);

  // 3. Islamic Calendar Converter State
  const [gregorianInput, setGregorianInput] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [convertedHijri, setConvertedHijri] = useState<{
    day: string;
    monthEn: string;
    monthAr: string;
    year: string;
    weekday: string;
  } | null>(null);
  const [convertingDate, setConvertingDate] = useState(false);

  async function convertGregorianToHijri(isoDate: string) {
    if (!isoDate) return;
    const [yyyy, mm, dd] = isoDate.split("-");
    if (!yyyy || !mm || !dd) return;
    setConvertingDate(true);
    try {
      const res = await fetch(`/api/calendar/convert?mode=gToH&date=${dd}-${mm}-${yyyy}`);
      if (res.ok) {
        const data = await res.json();
        setConvertedHijri({
          day: data.hijri.day,
          monthEn: data.hijri.month.en,
          monthAr: data.hijri.month.ar,
          year: data.hijri.year,
          weekday: data.gregorian.weekday.en,
        });
      }
    } finally {
      setConvertingDate(false);
    }
  }

  useEffect(() => {
    if (subTab === "calendar" && !convertedHijri) {
      convertGregorianToHijri(gregorianInput);
    }
  }, [subTab]);

  // 4. Zakat Calculator State
  const [nisabBasis, setNisabBasis] = useState<"silver" | "gold">("silver");
  const [goldPricePerGram, setGoldPricePerGram] = useState(86.5);
  const [silverPricePerGram, setSilverPricePerGram] = useState(1.05);
  const [goldGrams, setGoldGrams] = useState(0);
  const [silverGrams, setSilverGrams] = useState(0);
  const [cashSavings, setCashSavings] = useState(5000);
  const [investments, setInvestments] = useState(2500);
  const [businessInventory, setBusinessInventory] = useState(0);
  const [shortTermDebts, setShortTermDebts] = useState(500);

  const zakatSummary = useMemo(() => {
    const goldValue = goldGrams * goldPricePerGram;
    const silverValue = silverGrams * silverPricePerGram;
    const grossAssets =
      goldValue + silverValue + cashSavings + investments + businessInventory;
    const netWealth = Math.max(0, grossAssets - shortTermDebts);
    const nisabThreshold =
      nisabBasis === "gold"
        ? 87.48 * goldPricePerGram
        : 612.36 * silverPricePerGram;
    const eligible = netWealth >= nisabThreshold && netWealth > 0;
    const zakatDue = eligible ? netWealth * 0.025 : 0;
    return {
      grossAssets,
      netWealth,
      nisabThreshold,
      eligible,
      zakatDue,
    };
  }, [
    goldGrams,
    silverGrams,
    goldPricePerGram,
    silverPricePerGram,
    cashSavings,
    investments,
    businessInventory,
    shortTermDebts,
    nisabBasis,
  ]);

  // 5. Halal Finder State
  const [halalPlaces, setHalalPlaces] = useState<HalalPlace[]>([]);
  const [halalFilter, setHalalFilter] = useState<"all" | "mosque" | "halal">("all");
  const [loadingHalal, setLoadingHalal] = useState(false);
  const [halalError, setHalalError] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  async function fetchNearbyHalal() {
    setLoadingHalal(true);
    setHalalError(null);
    try {
      const res = await fetch(
        `/api/halal/nearby?lat=${location.lat}&lng=${location.lng}&radius=5000`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to fetch nearby venues.");
      setHalalPlaces(data.places ?? []);
    } catch (err) {
      setHalalError(err instanceof Error ? err.message : "Failed to load places.");
    } finally {
      setLoadingHalal(false);
    }
  }

  useEffect(() => {
    if (subTab === "halal") {
      fetchNearbyHalal();
    }
  }, [subTab, location.lat, location.lng]);

  const visiblePlaces = useMemo(() => {
    return halalPlaces.filter(
      (p) => halalFilter === "all" || p.category === halalFilter
    );
  }, [halalPlaces, halalFilter]);

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7E2] pb-4 dark:border-[#1D2E26]">
        <div>
          <h1 className="text-xl font-bold text-[#111815] dark:text-[#EEF2EF]">
            Daily Worship & Utility Modules
          </h1>
          <p className="text-xs text-[#526058] dark:text-[#98A89E]">
            Tasbih counter, authentic Hadith & Duas, Hijri calendar, Zakat calculator, and Halal Finder
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#EFEFE9] p-1 dark:bg-[#111C17]">
          {(
            [
              { id: "tasbih", label: "Tasbih" },
              { id: "hadith", label: "Hadith & Duas" },
              { id: "calendar", label: "Hijri Calendar" },
              { id: "zakat", label: "Zakat" },
              { id: "halal", label: "Halal Finder" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`min-h-[36px] shrink-0 whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                subTab === tab.id
                  ? "bg-white text-[#065F46] shadow-xs dark:bg-[#064E3B] dark:text-white"
                  : "text-[#526058] hover:text-[#111815] dark:text-[#98A89E] dark:hover:text-[#EEF2EF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MODULE 1: DIGITAL TASBIH */}
      {subTab === "tasbih" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col items-center justify-between rounded-xl border border-[#E5E7E2] bg-white p-8 lg:col-span-7 dark:border-[#1D2E26] dark:bg-[#111C17]">
            <div className="w-full space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <select
                  aria-label="Select Dhikr Phrase"
                  value={selectedPhraseId}
                  onChange={(e) => {
                    const next = DHIKR_PHRASES.find((p) => p.id === e.target.value);
                    setSelectedPhraseId(e.target.value);
                    if (next) setTasbihTarget(next.defaultTarget);
                    setTasbihCount(0);
                  }}
                  className="h-9 rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-3 text-xs font-semibold text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                >
                  {DHIKR_PHRASES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.phrase} (Target {p.defaultTarget})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  {[33, 99, 100].map((target) => (
                    <button
                      key={target}
                      type="button"
                      onClick={() => setTasbihTarget(target)}
                      className={`font-mono-tabular rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                        tasbihTarget === target
                          ? "border-[#065F46] bg-[#065F46]/10 text-[#065F46] dark:border-[#10B981] dark:text-[#10B981]"
                          : "border-[#E5E7E2] text-[#526058] dark:border-[#1D2E26] dark:text-[#98A89E]"
                      }`}
                    >
                      {target}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-center">
                <p
                  dir="rtl"
                  className="font-arabic text-3xl text-[#065F46] dark:text-[#D4AF37]"
                >
                  {activePhrase.arabic}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#111815] dark:text-[#EEF2EF]">
                  {activePhrase.phrase}
                </p>
                <p className="text-xs text-[#526058] dark:text-[#98A89E]">
                  {activePhrase.meaning}
                </p>
              </div>
            </div>

            {/* Tactile Circular Ring Counter */}
            <div className="my-8 flex flex-col items-center">
              <button
                type="button"
                onClick={handleTasbihTap}
                className="group relative flex h-52 w-52 items-center justify-center rounded-full border-2 border-[#E5E7E2] bg-[#FAFAF7] transition-transform duration-100 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#065F46] dark:border-[#1D2E26] dark:bg-[#0A110E]"
              >
                <svg
                  viewBox="0 0 120 120"
                  className="absolute inset-0 h-full w-full -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-[#E5E7E2] dark:text-[#1D2E26]"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#065F46"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={339.29}
                    strokeDashoffset={
                      339.29 *
                      (1 - Math.min(tasbihCount, tasbihTarget) / Math.max(1, tasbihTarget))
                    }
                    className="transition-all duration-150 dark:stroke-[#10B981]"
                  />
                </svg>

                <div className="relative z-10 text-center">
                  <span className="font-mono-tabular block text-5xl font-bold tracking-tight text-[#111815] dark:text-[#EEF2EF]">
                    {tasbihCount}
                  </span>
                  <span className="font-mono-tabular mt-1 block text-xs text-[#526058] dark:text-[#98A89E]">
                    of {tasbihTarget}
                  </span>
                </div>
              </button>
              <p className="mt-3 text-xs text-[#6B7A71] dark:text-[#98A89E]">
                Tap ring to count · Haptic & tactile audio enabled
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-[#E5E7E2] pt-4 dark:border-[#1D2E26]">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[#526058] dark:text-[#98A89E]">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="accent-[#065F46]"
                />
                Bead click audio
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTasbihCount(0)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E7E2] px-3 text-xs font-medium text-[#526058] hover:text-[#111815] dark:border-[#1D2E26] dark:text-[#98A89E]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSaveTasbihSession}
                  disabled={tasbihCount === 0}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#065F46] px-4 text-xs font-semibold text-white hover:bg-[#047857] disabled:opacity-40 dark:bg-[#059669]"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save Session
                </button>
              </div>
            </div>
          </div>

          {/* Tasbih History Log */}
          <div className="flex flex-col rounded-xl border border-[#E5E7E2] bg-white p-6 lg:col-span-5 dark:border-[#1D2E26] dark:bg-[#111C17]">
            <div className="flex items-baseline justify-between border-b border-[#E5E7E2] pb-4 dark:border-[#1D2E26]">
              <div>
                <h2 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
                  Dhikr Session History
                </h2>
                <p className="text-xs text-[#526058] dark:text-[#98A89E]">
                  Persisted locally across sessions
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono-tabular text-xl font-bold text-[#065F46] dark:text-[#10B981]">
                  {totalTasbihLogged.toLocaleString()}
                </span>
                <p className="text-[11px] text-[#526058] dark:text-[#98A89E]">Total Beads</p>
              </div>
            </div>

            <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto max-h-[380px]">
              {tasbihLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#526058] dark:text-[#98A89E]">
                  Complete a dhikr set and press &ldquo;Save Session&rdquo; to track your consistency.
                </div>
              ) : (
                tasbihLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between border-b border-[#E5E7E2]/60 pb-2.5 text-xs last:border-b-0 dark:border-[#1D2E26]"
                  >
                    <div>
                      <p className="font-semibold text-[#111815] dark:text-[#EEF2EF]">
                        {log.phrase}
                      </p>
                      <p className="text-[11px] text-[#6B7A71] dark:text-[#98A89E]">
                        {new Date(log.completedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono-tabular font-semibold text-[#065F46] dark:text-[#10B981]">
                        {log.count} / {log.target}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: HADITH & DUAS */}
      {subTab === "hadith" && (
        <div className="space-y-8">
          {/* Dua of the Day */}
          <section className="rounded-xl border border-[#E5E7E2] bg-[#064E3B] p-6 text-white sm:p-8 dark:border-[#1D2E26]">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#FDE68A]">
              <span className="font-semibold">Dua of the Day · {duaOfTheDay.category}</span>
              <span>{duaOfTheDay.reference}</span>
            </div>
            <h2 className="mt-2 text-xl font-bold">{duaOfTheDay.title}</h2>
            <p dir="rtl" className="font-arabic mt-4 text-right text-2xl leading-[2.1] text-[#FDE68A]">
              {duaOfTheDay.arabic}
            </p>
            <p className="mt-3 text-xs italic text-white/80">{duaOfTheDay.transliteration}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/95">{duaOfTheDay.english}</p>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Authentic Hadith Browser */}
            <section className="rounded-xl border border-[#E5E7E2] bg-white p-6 dark:border-[#1D2E26] dark:bg-[#111C17]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7E2] pb-4 dark:border-[#1D2E26]">
                <div className="flex items-center gap-2">
                  <BookMarked className="h-4 w-4 text-[#065F46] dark:text-[#10B981]" />
                  <h3 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
                    Authentic Hadith Collection
                  </h3>
                </div>
                <select
                  aria-label="Filter Hadith collection"
                  value={hadithFilter}
                  onChange={(e) => setHadithFilter(e.target.value)}
                  className="h-8 rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-2.5 text-xs text-[#111815] dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                >
                  <option value="All">All Collections</option>
                  <option value="Sahih al-Bukhari">Sahih al-Bukhari</option>
                  <option value="Sahih Muslim">Sahih Muslim</option>
                  <option value="Jami' at-Tirmidhi">Jami&apos; at-Tirmidhi</option>
                  <option value="Sunan Abi Dawud">Sunan Abi Dawud</option>
                </select>
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7A71]" />
                <input
                  type="text"
                  value={hadithQuery}
                  onChange={(e) => setHadithQuery(e.target.value)}
                  placeholder="Search by topic, narrator, or text..."
                  className="h-9 w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] pl-8 pr-3 text-xs text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                />
              </div>

              <div className="mt-4 divide-y divide-[#E5E7E2] dark:divide-[#1D2E26]">
                {filteredHadiths.map((h) => (
                  <article key={h.id} className="py-4 first:pt-1 last:pb-0">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#526058] dark:text-[#98A89E]">
                      <span className="font-semibold text-[#065F46] dark:text-[#10B981]">
                        {h.collection} · {h.reference}
                      </span>
                      <span>
                        {h.topic} · {h.grade}
                      </span>
                    </div>
                    <p
                      dir="rtl"
                      className="font-arabic mt-2 text-right text-lg leading-[2] text-[#111815] dark:text-[#EEF2EF]"
                    >
                      {h.arabic}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-[#2C3832] dark:text-[#CBD5CE]">
                      &ldquo;{h.english}&rdquo;
                    </p>
                    <p className="mt-1.5 text-[11px] text-[#6B7A71] dark:text-[#98A89E]">
                      Narrated by {h.narrator}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* Categorized Duas */}
            <section className="rounded-xl border border-[#E5E7E2] bg-white p-6 dark:border-[#1D2E26] dark:bg-[#111C17]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7E2] pb-4 dark:border-[#1D2E26]">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#B8860B] dark:text-[#D4AF37]" />
                  <h3 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
                    Categorized Duas
                  </h3>
                </div>
                <select
                  aria-label="Filter Dua category"
                  value={duaCategory}
                  onChange={(e) => setDuaCategory(e.target.value)}
                  className="h-8 rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-2.5 text-xs text-[#111815] dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                >
                  <option value="All">All Categories</option>
                  <option value="Morning & Evening">Morning &amp; Evening</option>
                  <option value="Anxiety & Relief">Anxiety &amp; Relief</option>
                  <option value="Forgiveness">Forgiveness</option>
                  <option value="Travel">Travel</option>
                  <option value="Daily Sunnah">Daily Sunnah</option>
                </select>
              </div>

              <div className="mt-4 divide-y divide-[#E5E7E2] dark:divide-[#1D2E26]">
                {filteredDuas.map((dua) => (
                  <article key={dua.id} className="py-4 first:pt-1 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] text-[#526058] dark:text-[#98A89E]">
                        <span className="font-semibold text-[#B8860B] dark:text-[#D4AF37]">
                          {dua.category}
                        </span>{" "}
                        · {dua.reference}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(
                            `${dua.arabic}\n${dua.transliteration}\n${dua.english}`
                          );
                          setCopiedId(dua.id);
                          setTimeout(() => setCopiedId(null), 1500);
                        }}
                        aria-label={`Copy ${dua.title}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#526058] hover:text-[#065F46] dark:text-[#98A89E]"
                      >
                        {copiedId === dua.id ? (
                          <>
                            <Check className="h-3 w-3 text-[#065F46]" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <h4 className="mt-1 text-sm font-semibold text-[#111815] dark:text-[#EEF2EF]">
                      {dua.title}
                    </h4>
                    <p
                      dir="rtl"
                      className="font-arabic mt-2 text-right text-lg leading-[2] text-[#111815] dark:text-[#EEF2EF]"
                    >
                      {dua.arabic}
                    </p>
                    <p className="mt-1.5 text-[11px] italic text-[#526058] dark:text-[#98A89E]">
                      {dua.transliteration}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#2C3832] dark:text-[#CBD5CE]">
                      {dua.english}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* MODULE 3: ISLAMIC CALENDAR */}
      {subTab === "calendar" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Hijri Converter */}
          <div className="rounded-xl border border-[#E5E7E2] bg-white p-6 lg:col-span-5 dark:border-[#1D2E26] dark:bg-[#111C17]">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#065F46] dark:text-[#10B981]" />
              <h2 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
                Hijri Calendar Converter
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#526058] dark:text-[#98A89E]">
              Convert any Gregorian date to its astronomical Hijri equivalent via Aladhan.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="greg-date"
                  className="mb-1.5 block text-xs font-medium text-[#526058] dark:text-[#98A89E]"
                >
                  Gregorian Date
                </label>
                <div className="flex gap-2">
                  <input
                    id="greg-date"
                    type="date"
                    value={gregorianInput}
                    onChange={(e) => {
                      setGregorianInput(e.target.value);
                      convertGregorianToHijri(e.target.value);
                    }}
                    className="font-mono-tabular h-10 flex-1 rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-3 text-sm text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                  />
                  <button
                    type="button"
                    onClick={() => convertGregorianToHijri(gregorianInput)}
                    disabled={convertingDate}
                    className="h-10 rounded-lg bg-[#065F46] px-4 text-xs font-semibold text-white hover:bg-[#047857] dark:bg-[#059669]"
                  >
                    {convertingDate ? "..." : "Convert"}
                  </button>
                </div>
              </div>

              {convertedHijri && (
                <div className="rounded-xl border border-[#E5E7E2] bg-[#FAFAF7] p-5 dark:border-[#1D2E26] dark:bg-[#0A110E]">
                  <p className="text-xs text-[#526058] dark:text-[#98A89E]">
                    {convertedHijri.weekday} · Hijri Correspondence
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#065F46] dark:text-[#10B981]">
                    {convertedHijri.day} {convertedHijri.monthEn} {convertedHijri.year} AH
                  </p>
                  <p dir="rtl" className="font-arabic mt-2 text-xl text-[#B8860B] dark:text-[#D4AF37]">
                    {convertedHijri.day} {convertedHijri.monthAr} {convertedHijri.year}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Major Islamic Milestones & Countdowns */}
          <div className="rounded-xl border border-[#E5E7E2] bg-white p-6 lg:col-span-7 dark:border-[#1D2E26] dark:bg-[#111C17]">
            <h2 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
              Upcoming Islamic Dates & Countdowns
            </h2>
            <p className="mt-0.5 text-xs text-[#526058] dark:text-[#98A89E]">
              Lunar sighting estimates relative to today&apos;s date
            </p>

            <div className="mt-4 divide-y divide-[#E5E7E2] dark:divide-[#1D2E26]">
              {ISLAMIC_MILESTONES.map((event) => {
                const diffDays = Math.ceil(
                  (new Date(event.isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={event.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-0"
                  >
                    <div className="max-w-md">
                      <div className="flex items-center gap-2 text-[11px] text-[#526058] dark:text-[#98A89E]">
                        <span className="font-semibold text-[#B8860B] dark:text-[#D4AF37]">
                          {event.hijriDate}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Est. {event.gregorianEstimate}</span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold text-[#111815] dark:text-[#EEF2EF]">
                        {event.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[#526058] dark:text-[#98A89E]">
                        {event.significance}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono-tabular text-lg font-bold text-[#065F46] dark:text-[#10B981]">
                        {diffDays > 0 ? `${diffDays}d` : diffDays === 0 ? "Today" : "Passed"}
                      </span>
                      <p className="font-arabic text-sm text-[#526058] dark:text-[#98A89E]">
                        {event.arabicName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: ZAKAT CALCULATOR */}
      {subTab === "zakat" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-[#E5E7E2] bg-white p-6 lg:col-span-7 dark:border-[#1D2E26] dark:bg-[#111C17]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7E2] pb-4 dark:border-[#1D2E26]">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-[#065F46] dark:text-[#10B981]" />
                <h2 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
                  Zakatable Assets & Liabilities
                </h2>
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-[#FAFAF7] p-1 dark:bg-[#0A110E]">
                <button
                  type="button"
                  onClick={() => setNisabBasis("silver")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    nisabBasis === "silver"
                      ? "bg-white text-[#065F46] shadow-xs dark:bg-[#111C17] dark:text-[#10B981]"
                      : "text-[#526058] dark:text-[#98A89E]"
                  }`}
                >
                  Silver Nisab (612.36g)
                </button>
                <button
                  type="button"
                  onClick={() => setNisabBasis("gold")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    nisabBasis === "gold"
                      ? "bg-white text-[#065F46] shadow-xs dark:bg-[#111C17] dark:text-[#10B981]"
                      : "text-[#526058] dark:text-[#98A89E]"
                  }`}
                >
                  Gold Nisab (87.48g)
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-[#526058] dark:text-[#98A89E]">
                  Gold Spot Price ($ / gram)
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={goldPricePerGram}
                  onChange={(e) => setGoldPricePerGram(Math.max(0, Number(e.target.value)))}
                  className="font-mono-tabular mt-1 h-10 w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-3 text-sm text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#526058] dark:text-[#98A89E]">
                  Silver Spot Price ($ / gram)
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.05}
                  value={silverPricePerGram}
                  onChange={(e) => setSilverPricePerGram(Math.max(0, Number(e.target.value)))}
                  className="font-mono-tabular mt-1 h-10 w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-3 text-sm text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#526058] dark:text-[#98A89E]">
                  Gold Held (grams)
                </span>
                <input
                  type="number"
                  min={0}
                  value={goldGrams}
                  onChange={(e) => setGoldGrams(Math.max(0, Number(e.target.value)))}
                  className="font-mono-tabular mt-1 h-10 w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-3 text-sm text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#526058] dark:text-[#98A89E]">
                  Silver Held (grams)
                </span>
                <input
                  type="number"
                  min={0}
                  value={silverGrams}
                  onChange={(e) => setSilverGrams(Math.max(0, Number(e.target.value)))}
                  className="font-mono-tabular mt-1 h-10 w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-3 text-sm text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#526058] dark:text-[#98A89E]">
                  Cash &amp; Bank Balances ($)
                </span>
                <input
                  type="number"
                  min={0}
                  value={cashSavings}
                  onChange={(e) => setCashSavings(Math.max(0, Number(e.target.value)))}
                  className="font-mono-tabular mt-1 h-10 w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-3 text-sm text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#526058] dark:text-[#98A89E]">
                  Stocks &amp; Investments ($)
                </span>
                <input
                  type="number"
                  min={0}
                  value={investments}
                  onChange={(e) => setInvestments(Math.max(0, Number(e.target.value)))}
                  className="font-mono-tabular mt-1 h-10 w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-3 text-sm text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#526058] dark:text-[#98A89E]">
                  Business Trade Inventory ($)
                </span>
                <input
                  type="number"
                  min={0}
                  value={businessInventory}
                  onChange={(e) => setBusinessInventory(Math.max(0, Number(e.target.value)))}
                  className="font-mono-tabular mt-1 h-10 w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-3 text-sm text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#526058] dark:text-[#98A89E]">
                  Deductible Short-Term Liabilities ($)
                </span>
                <input
                  type="number"
                  min={0}
                  value={shortTermDebts}
                  onChange={(e) => setShortTermDebts(Math.max(0, Number(e.target.value)))}
                  className="font-mono-tabular mt-1 h-10 w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-3 text-sm text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                />
              </label>
            </div>
          </div>

          {/* Zakat Calculation Summary */}
          <div className="flex flex-col justify-between rounded-xl border border-[#E5E7E2] bg-[#064E3B] p-6 text-white lg:col-span-5 dark:border-[#1D2E26]">
            <div>
              <p className="text-xs font-semibold text-[#FDE68A]">
                Annual Zakat Obligation (2.5%)
              </p>
              <p className="font-mono-tabular mt-2 text-4xl font-bold tracking-tight">
                ${zakatSummary.zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="mt-2 text-xs text-white/80">
                {zakatSummary.eligible
                  ? "Your net wealth meets or exceeds the Nisab threshold held for one lunar year (Hawl)."
                  : "Your net wealth is currently below the selected Nisab threshold; Zakat is not obligatory."}
              </p>
            </div>

            <div className="mt-8 space-y-3 border-t border-white/15 pt-5 text-xs">
              <div className="flex justify-between">
                <span className="text-white/75">Gross Zakatable Assets</span>
                <span className="font-mono-tabular font-semibold">
                  ${zakatSummary.grossAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/75">Short-Term Liabilities</span>
                <span className="font-mono-tabular font-semibold">
                  -${shortTermDebts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/15 pt-2.5">
                <span className="text-white/90">Net Zakatable Wealth</span>
                <span className="font-mono-tabular font-bold text-[#FDE68A]">
                  ${zakatSummary.netWealth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/75">
                  Active Nisab ({nisabBasis === "gold" ? "87.48g Gold" : "612.36g Silver"})
                </span>
                <span className="font-mono-tabular font-semibold">
                  ${zakatSummary.nisabThreshold.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: HALAL FINDER */}
      {subTab === "halal" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Interactive Spatial Radar Map */}
          <div className="flex flex-col justify-between rounded-xl border border-[#E5E7E2] bg-white p-6 lg:col-span-5 dark:border-[#1D2E26] dark:bg-[#111C17]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
                  Spatial Proximity Radar · {location.city}
                </h2>
                <p className="text-xs text-[#526058] dark:text-[#98A89E]">
                  5 km radius via OpenStreetMap Overpass ·{" "}
                  <button
                    type="button"
                    onClick={onOpenLocation}
                    className="font-semibold text-[#065F46] hover:underline dark:text-[#10B981]"
                  >
                    Switch City
                  </button>
                </p>
              </div>

              <button
                type="button"
                onClick={fetchNearbyHalal}
                disabled={loadingHalal}
                aria-label="Refresh nearby places"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7E2] text-[#526058] hover:border-[#065F46] dark:border-[#1D2E26] dark:text-[#98A89E]"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingHalal ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* SVG Polar Radar Plotting Real Bearing & Distance */}
            <div className="my-5 flex items-center justify-center">
              <svg viewBox="0 0 260 260" className="h-64 w-64">
                <circle
                  cx="130"
                  cy="130"
                  r="110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-[#E5E7E2] dark:text-[#1D2E26]"
                />
                <circle
                  cx="130"
                  cy="130"
                  r="72"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="3 4"
                  strokeWidth="1"
                  className="text-[#E5E7E2] dark:text-[#1D2E26]"
                />
                <circle
                  cx="130"
                  cy="130"
                  r="36"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="3 4"
                  strokeWidth="1"
                  className="text-[#E5E7E2] dark:text-[#1D2E26]"
                />
                <line
                  x1="130"
                  y1="15"
                  x2="130"
                  y2="245"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  className="text-[#E5E7E2] dark:text-[#1D2E26]"
                />
                <line
                  x1="15"
                  y1="130"
                  x2="245"
                  y2="130"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  className="text-[#E5E7E2] dark:text-[#1D2E26]"
                />

                {/* Plot Places by polar distance/bearing */}
                {visiblePlaces.slice(0, 20).map((place, index) => {
                  const r = Math.min(104, Math.max(18, (place.distanceKm / 5) * 104));
                  const rad = ((place.bearingDeg - 90) * Math.PI) / 180;
                  const x = 130 + r * Math.cos(rad);
                  const y = 130 + r * Math.sin(rad);
                  const isSel = selectedPlaceId === place.id;
                  return (
                    <g
                      key={place.id}
                      onClick={() => setSelectedPlaceId(place.id)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isSel ? 8 : 5.5}
                        fill={place.category === "mosque" ? "#065F46" : "#B8860B"}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      <text
                        x={x}
                        y={y + 3}
                        textAnchor="middle"
                        className="fill-white text-[7px] font-bold pointer-events-none"
                      >
                        {index + 1}
                      </text>
                    </g>
                  );
                })}

                {/* User center node */}
                <circle cx="130" cy="130" r="6" fill="#111815" stroke="#10B981" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex items-center justify-between border-t border-[#E5E7E2] pt-3 text-xs text-[#526058] dark:border-[#1D2E26] dark:text-[#98A89E]">
              <span>Emerald: Masjids</span>
              <span>Gold: Halal Dining</span>
              <span className="font-mono-tabular">R = 5.0 km</span>
            </div>
          </div>

          {/* Venue List */}
          <div className="rounded-xl border border-[#E5E7E2] bg-white p-6 lg:col-span-7 dark:border-[#1D2E26] dark:bg-[#111C17]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7E2] pb-4 dark:border-[#1D2E26]">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#065F46] dark:text-[#10B981]" />
                <h3 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
                  Nearby Mosques &amp; Halal Dining ({visiblePlaces.length})
                </h3>
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-[#FAFAF7] p-1 dark:bg-[#0A110E]">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "mosque", label: "Mosques" },
                    { id: "halal", label: "Halal Food" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setHalalFilter(f.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      halalFilter === f.id
                        ? "bg-white text-[#065F46] shadow-xs dark:bg-[#111C17] dark:text-[#10B981]"
                        : "text-[#526058] dark:text-[#98A89E]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 max-h-[380px] divide-y divide-[#E5E7E2] overflow-y-auto dark:divide-[#1D2E26]">
              {loadingHalal ? (
                <div className="py-12 text-center text-xs text-[#526058] dark:text-[#98A89E]">
                  Querying OpenStreetMap nodes near {location.city}...
                </div>
              ) : halalError ? (
                <div className="py-10 text-center text-xs text-[#B8860B]">
                  {halalError}
                </div>
              ) : visiblePlaces.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#526058] dark:text-[#98A89E]">
                  No tagged OpenStreetMap venues found within 5 km. Try London, New York, Istanbul, or Kuala Lumpur.
                </div>
              ) : (
                visiblePlaces.map((place, index) => {
                  const isSel = selectedPlaceId === place.id;
                  return (
                    <div
                      key={place.id}
                      onClick={() => setSelectedPlaceId(place.id)}
                      className={`flex cursor-pointer items-center justify-between gap-4 py-3.5 px-2 transition-colors ${
                        isSel
                          ? "bg-[#065F46]/6 dark:bg-[#10B981]/10"
                          : "hover:bg-[#FAFAF7] dark:hover:bg-[#192821]/50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[11px] text-[#526058] dark:text-[#98A89E]">
                          <span className="font-mono-tabular font-semibold text-[#111815] dark:text-[#EEF2EF]">
                            #{index + 1}
                          </span>
                          <span
                            className={`font-semibold ${
                              place.category === "mosque"
                                ? "text-[#065F46] dark:text-[#10B981]"
                                : "text-[#B8860B] dark:text-[#D4AF37]"
                            }`}
                          >
                            {place.category === "mosque" ? "Masjid" : "Halal Dining"}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{place.cuisine}</span>
                        </div>
                        <p className="mt-0.5 truncate text-sm font-semibold text-[#111815] dark:text-[#EEF2EF]">
                          {place.name}
                        </p>
                        <p className="truncate text-xs text-[#526058] dark:text-[#98A89E]">
                          {place.address}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <div className="text-right">
                          <span className="font-mono-tabular text-xs font-bold text-[#111815] dark:text-[#EEF2EF]">
                            {place.distanceKm} km
                          </span>
                          <p className="font-mono-tabular flex items-center justify-end gap-0.5 text-[11px] text-[#6B7A71]">
                            <Navigation className="h-2.5 w-2.5" />
                            {place.bearingDeg}°
                          </p>
                        </div>

                        <a
                          href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=17/${place.lat}/${place.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${place.name} on map`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7E2] text-[#526058] hover:border-[#065F46] hover:text-[#065F46] dark:border-[#1D2E26] dark:text-[#98A89E]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
