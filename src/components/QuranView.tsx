import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  StickyNote,
  Volume2,
} from "lucide-react";
import {
  QuranBookmark,
  QuranNote,
  SurahDetail,
  SurahSummary,
} from "../types/deenos";

type TranslationMode = "sahih" | "pickthall" | "both";
type QariEdition = "ar.alafasy" | "ar.abdurrahmaansudais" | "ar.abdulbasitmurattal";

interface SearchMatch {
  number: number;
  numberInSurah: number;
  text: string;
  surah: { number: number; name: string; englishName: string };
}

export function QuranView() {
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(() => {
    const saved = localStorage.getItem("deenos_last_read");
    if (saved) {
      try {
        return JSON.parse(saved).surahNumber || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  });
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSurah, setLoadingSurah] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [surahFilter, setSurahFilter] = useState("");
  const [translationMode, setTranslationMode] = useState<TranslationMode>("sahih");
  const [qari, setQari] = useState<QariEdition>("ar.alafasy");
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // Audio playback & verse sync
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [activeAyahIndex, setActiveAyahIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Bookmarks, last-read, notes
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("deenos_quran_bookmarks") || "[]");
    } catch {
      return [];
    }
  });
  const [notes, setNotes] = useState<QuranNote[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("deenos_quran_notes") || "[]");
    } catch {
      return [];
    }
  });
  const [lastRead, setLastRead] = useState<{
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
  } | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("deenos_last_read") || "null");
    } catch {
      return null;
    }
  });

  const [editingNoteAyah, setEditingNoteAyah] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // Global search
  const [sidebarMode, setSidebarMode] = useState<"surahs" | "bookmarks" | "search">("surahs");
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchLang, setSearchLang] = useState<"en" | "ar">("en");
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingJumpAyah, setPendingJumpAyah] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem("deenos_quran_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("deenos_quran_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    let cancelled = false;
    async function fetchSurahs() {
      setLoadingList(true);
      try {
        const res = await fetch("/api/quran/surahs");
        if (!res.ok) throw new Error("Failed to load Surah index.");
        const data = (await res.json()) as SurahSummary[];
        if (!cancelled) setSurahs(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load Quran index.");
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }
    fetchSurahs();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }

    async function fetchSurah() {
      setLoadingSurah(true);
      setError(null);
      try {
        const res = await fetch(`/api/quran/surah/${selectedSurahNum}?qari=${qari}`);
        if (!res.ok) throw new Error("Unable to fetch Surah verses.");
        const data = (await res.json()) as SurahDetail;
        if (!cancelled) {
          setSurahDetail(data);
          const jumpIdx =
            pendingJumpAyah && pendingJumpAyah <= data.ayahs.length
              ? pendingJumpAyah - 1
              : 0;
          setActiveAyahIndex(jumpIdx);
          setPendingJumpAyah(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error loading Surah.");
        }
      } finally {
        if (!cancelled) setLoadingSurah(false);
      }
    }
    fetchSurah();
    return () => {
      cancelled = true;
    };
  }, [selectedSurahNum, qari]);

  // Sync audio element with activeAyahIndex & playbackRate
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !surahDetail) return;
    const activeAyah = surahDetail.ayahs[activeAyahIndex];
    if (!activeAyah) return;

    if (audio.src !== activeAyah.audioUrl) {
      audio.src = activeAyah.audioUrl;
    }
    audio.playbackRate = playbackRate;

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }

    // Update last-read tracker
    const progress = {
      surahNumber: surahDetail.number,
      surahName: surahDetail.englishName,
      ayahNumber: activeAyah.numberInSurah,
    };
    setLastRead(progress);
    localStorage.setItem("deenos_last_read", JSON.stringify(progress));

    // Smooth auto-scroll active verse into view while playing
    if (isPlaying) {
      ayahRefs.current[activeAyah.numberInSurah]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeAyahIndex, isPlaying, surahDetail, playbackRate]);

  function handleTogglePlay() {
    const audio = audioRef.current;
    if (!audio || !surahDetail) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }

  function handlePlaySpecificAyah(idx: number) {
    setActiveAyahIndex(idx);
    setIsPlaying(true);
  }

  function handleAudioEnded() {
    if (!surahDetail) return;
    if (activeAyahIndex < surahDetail.ayahs.length - 1) {
      setActiveAyahIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }

  function toggleBookmark(ayahIndex: number) {
    if (!surahDetail) return;
    const ayah = surahDetail.ayahs[ayahIndex];
    const exists = bookmarks.some(
      (b) => b.surahNumber === surahDetail.number && b.ayahNumber === ayah.numberInSurah
    );
    if (exists) {
      setBookmarks((prev) =>
        prev.filter(
          (b) => !(b.surahNumber === surahDetail.number && b.ayahNumber === ayah.numberInSurah)
        )
      );
    } else {
      setBookmarks((prev) => [
        {
          surahNumber: surahDetail.number,
          surahName: surahDetail.englishName,
          ayahNumber: ayah.numberInSurah,
          arabicPreview: ayah.arabic.slice(0, 80),
          translationPreview: ayah.sahih.slice(0, 110),
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  }

  function saveAyahNote(ayahNumber: number) {
    if (!surahDetail) return;
    const trimmed = noteDraft.trim();
    const id = `${surahDetail.number}:${ayahNumber}`;
    if (!trimmed) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setEditingNoteAyah(null);
      return;
    }
    setNotes((prev) => {
      const rest = prev.filter((n) => n.id !== id);
      return [
        {
          id,
          surahNumber: surahDetail.number,
          surahName: surahDetail.englishName,
          ayahNumber,
          note: trimmed,
          updatedAt: new Date().toISOString(),
        },
        ...rest,
      ];
    });
    setEditingNoteAyah(null);
    setNoteDraft("");
  }

  async function handleGlobalSearch(e: React.FormEvent) {
    e.preventDefault();
    if (globalQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const res = await fetch(
        `/api/quran/search?q=${encodeURIComponent(globalQuery.trim())}&lang=${searchLang}`
      );
      const data = await res.json();
      setSearchMatches(data.matches ?? []);
    } catch {
      setSearchMatches([]);
    } finally {
      setSearching(false);
    }
  }

  const filteredSurahs = useMemo(() => {
    const q = surahFilter.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        s.name.includes(surahFilter.trim()) ||
        String(s.number) === q
    );
  }, [surahs, surahFilter]);

  const currentAyah = surahDetail?.ayahs[activeAyahIndex];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />

      {/* Left Column: Surah Index, Bookmarks & Global Search */}
      <aside className="flex flex-col rounded-xl border border-[#E5E7E2] bg-white lg:col-span-4 lg:max-h-[calc(100vh-140px)] dark:border-[#1D2E26] dark:bg-[#111C17]">
        <div className="border-b border-[#E5E7E2] p-4 dark:border-[#1D2E26]">
          <div className="flex items-center gap-1 rounded-lg bg-[#FAFAF7] p-1 dark:bg-[#0A110E]">
            <button
              type="button"
              onClick={() => setSidebarMode("surahs")}
              className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                sidebarMode === "surahs"
                  ? "bg-white text-[#065F46] shadow-xs dark:bg-[#111C17] dark:text-[#10B981]"
                  : "text-[#526058] dark:text-[#98A89E]"
              }`}
            >
              114 Surahs
            </button>
            <button
              type="button"
              onClick={() => setSidebarMode("bookmarks")}
              className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                sidebarMode === "bookmarks"
                  ? "bg-white text-[#065F46] shadow-xs dark:bg-[#111C17] dark:text-[#10B981]"
                  : "text-[#526058] dark:text-[#98A89E]"
              }`}
            >
              Saved ({bookmarks.length})
            </button>
            <button
              type="button"
              onClick={() => setSidebarMode("search")}
              className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                sidebarMode === "search"
                  ? "bg-white text-[#065F46] shadow-xs dark:bg-[#111C17] dark:text-[#10B981]"
                  : "text-[#526058] dark:text-[#98A89E]"
              }`}
            >
              Search
            </button>
          </div>

          {sidebarMode === "surahs" && (
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7A71]" />
              <input
                type="text"
                value={surahFilter}
                onChange={(e) => setSurahFilter(e.target.value)}
                placeholder="Filter by name, number, or Arabic..."
                className="h-9 w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] pl-8 pr-3 text-xs text-[#111815] placeholder:text-[#6B7A71] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
              />
            </div>
          )}

          {sidebarMode === "search" && (
            <form onSubmit={handleGlobalSearch} className="mt-3 space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  dir={searchLang === "ar" ? "rtl" : "ltr"}
                  value={globalQuery}
                  onChange={(e) => setGlobalQuery(e.target.value)}
                  placeholder={
                    searchLang === "ar" ? "ابحث في القرآن..." : "Search Quran in English..."
                  }
                  className="h-9 flex-1 rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-3 text-xs text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="h-9 shrink-0 rounded-lg bg-[#065F46] px-3 text-xs font-semibold text-white hover:bg-[#047857] dark:bg-[#059669]"
                >
                  {searching ? "..." : "Go"}
                </button>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#526058] dark:text-[#98A89E]">
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    checked={searchLang === "en"}
                    onChange={() => setSearchLang("en")}
                    className="accent-[#065F46]"
                  />
                  English (Sahih)
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    checked={searchLang === "ar"}
                    onChange={() => setSearchLang("ar")}
                    className="accent-[#065F46]"
                  />
                  Arabic Script
                </label>
              </div>
            </form>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7E2] dark:divide-[#1D2E26]">
          {sidebarMode === "surahs" && (
            <>
              {loadingList ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded-md bg-[#FAFAF7] dark:bg-[#0A110E]"
                    />
                  ))}
                </div>
              ) : (
                filteredSurahs.map((s) => {
                  const isActive = s.number === selectedSurahNum;
                  return (
                    <button
                      key={s.number}
                      type="button"
                      onClick={() => setSelectedSurahNum(s.number)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "bg-[#065F46]/8 text-[#065F46] dark:bg-[#10B981]/12 dark:text-[#10B981]"
                          : "hover:bg-[#FAFAF7] dark:hover:bg-[#192821]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono-tabular w-7 text-xs font-semibold text-[#6B7A71]">
                          {String(s.number).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-[#111815] dark:text-[#EEF2EF]">
                            {s.englishName}
                          </p>
                          <p className="text-[11px] text-[#526058] dark:text-[#98A89E]">
                            {s.englishNameTranslation} · {s.numberOfAyahs} Ayahs
                          </p>
                        </div>
                      </div>
                      <span className="font-arabic text-base text-[#065F46] dark:text-[#D4AF37]">
                        {s.name}
                      </span>
                    </button>
                  );
                })
              )}
            </>
          )}

          {sidebarMode === "bookmarks" && (
            <div className="divide-y divide-[#E5E7E2] dark:divide-[#1D2E26]">
              {bookmarks.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#526058] dark:text-[#98A89E]">
                  No verses bookmarked yet. Select the bookmark icon on any Ayah to save it for reflection.
                </div>
              ) : (
                bookmarks.map((b) => (
                  <button
                    key={`${b.surahNumber}:${b.ayahNumber}`}
                    type="button"
                    onClick={() => {
                      setPendingJumpAyah(b.ayahNumber);
                      setSelectedSurahNum(b.surahNumber);
                    }}
                    className="block w-full p-4 text-left hover:bg-[#FAFAF7] dark:hover:bg-[#192821]/50"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#065F46] dark:text-[#10B981]">
                      <span>
                        {b.surahName} · Ayah {b.ayahNumber}
                      </span>
                    </div>
                    <p
                      dir="rtl"
                      className="font-arabic mt-1.5 truncate text-base text-[#111815] dark:text-[#EEF2EF]"
                    >
                      {b.arabicPreview}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-[#526058] dark:text-[#98A89E]">
                      {b.translationPreview}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}

          {sidebarMode === "search" && (
            <div className="divide-y divide-[#E5E7E2] dark:divide-[#1D2E26]">
              {searchMatches.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#526058] dark:text-[#98A89E]">
                  Enter an English or Arabic phrase (e.g., &ldquo;mercy&rdquo;, &ldquo;patience&rdquo;, &ldquo;الرحمن&rdquo;) to search all 114 Surahs.
                </div>
              ) : (
                searchMatches.map((m) => (
                  <button
                    key={m.number}
                    type="button"
                    onClick={() => {
                      setPendingJumpAyah(m.numberInSurah);
                      setSelectedSurahNum(m.surah.number);
                    }}
                    className="block w-full p-4 text-left hover:bg-[#FAFAF7] dark:hover:bg-[#192821]/50"
                  >
                    <p className="text-xs font-semibold text-[#065F46] dark:text-[#10B981]">
                      {m.surah.englishName} ({m.surah.number}:{m.numberInSurah})
                    </p>
                    <p
                      dir={searchLang === "ar" ? "rtl" : "ltr"}
                      className={`mt-1 text-xs leading-relaxed text-[#111815] dark:text-[#EEF2EF] ${
                        searchLang === "ar" ? "font-arabic text-base" : ""
                      }`}
                    >
                      {m.text}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Right Column: Active Surah Reading Canvas & Synchronized Audio Player */}
      <div className="space-y-4 lg:col-span-8">
        {/* Reading Toolbar + Audio Sync Bar */}
        <div className="rounded-xl border border-[#E5E7E2] bg-white p-5 dark:border-[#1D2E26] dark:bg-[#111C17]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7E2] pb-4 dark:border-[#1D2E26]">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#526058] dark:text-[#98A89E]">
                <BookOpen className="h-3.5 w-3.5 text-[#065F46] dark:text-[#10B981]" />
                <span>Surah {surahDetail?.number ?? selectedSurahNum}</span>
                <span aria-hidden="true">·</span>
                <span>{surahDetail?.revelationType ?? "Revelation"}</span>
                <span aria-hidden="true">·</span>
                <span>{surahDetail?.numberOfAyahs ?? "—"} Ayahs</span>
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <h1 className="text-xl font-bold text-[#111815] dark:text-[#EEF2EF]">
                  {surahDetail?.englishName ?? "Loading..."}
                </h1>
                <span className="font-arabic text-2xl text-[#065F46] dark:text-[#D4AF37]">
                  {surahDetail?.name}
                </span>
              </div>
            </div>

            {lastRead && lastRead.surahNumber !== selectedSurahNum && (
              <button
                type="button"
                onClick={() => {
                  setPendingJumpAyah(lastRead.ayahNumber);
                  setSelectedSurahNum(lastRead.surahNumber);
                }}
                className="text-xs font-semibold text-[#B8860B] underline-offset-4 hover:underline dark:text-[#D4AF37]"
              >
                Resume Last Read: {lastRead.surahName} ({lastRead.ayahNumber})
              </button>
            )}
          </div>

          {/* Controls: Translation, Qari, Playback */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-[#FAFAF7] p-1 dark:bg-[#0A110E]">
                {(
                  [
                    { id: "sahih", label: "Sahih Int." },
                    { id: "pickthall", label: "Pickthall" },
                    { id: "both", label: "Dual" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTranslationMode(t.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                      translationMode === t.id
                        ? "bg-white text-[#065F46] shadow-xs dark:bg-[#111C17] dark:text-[#10B981]"
                        : "text-[#526058] dark:text-[#98A89E]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <select
                aria-label="Select Qari Reciter"
                value={qari}
                onChange={(e) => setQari(e.target.value as QariEdition)}
                className="h-8 rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-2.5 text-xs text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
              >
                <option value="ar.alafasy">Mishary Alafasy</option>
                <option value="ar.abdurrahmaansudais">Abdurrahman As-Sudais</option>
                <option value="ar.abdulbasitmurattal">Abdul Basit (Murattal)</option>
              </select>
            </div>

            {/* Audio Transport */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveAyahIndex((i) => Math.max(0, i - 1))}
                disabled={!surahDetail || activeAyahIndex === 0}
                aria-label="Previous Ayah"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7E2] text-[#111815] hover:border-[#065F46] disabled:opacity-40 dark:border-[#1D2E26] dark:text-[#EEF2EF]"
              >
                <SkipBack className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                disabled={!surahDetail}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#065F46] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#047857] disabled:opacity-50 dark:bg-[#059669]"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>
                  {isPlaying
                    ? `Playing ${surahDetail?.number}:${currentAyah?.numberInSurah ?? 1}`
                    : `Listen Ayah ${currentAyah?.numberInSurah ?? 1}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveAyahIndex((i) =>
                    surahDetail ? Math.min(surahDetail.ayahs.length - 1, i + 1) : i
                  )
                }
                disabled={!surahDetail || activeAyahIndex >= surahDetail.ayahs.length - 1}
                aria-label="Next Ayah"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7E2] text-[#111815] hover:border-[#065F46] disabled:opacity-40 dark:border-[#1D2E26] dark:text-[#EEF2EF]"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>

              <select
                aria-label="Playback speed"
                value={playbackRate}
                onChange={(e) => setPlaybackRate(Number(e.target.value))}
                className="font-mono-tabular h-9 rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-2 text-xs text-[#111815] dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
              >
                <option value={0.75}>0.75x</option>
                <option value={1}>1.0x</option>
                <option value={1.25}>1.25x</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ayahs List */}
        {loadingSurah ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-xl border border-[#E5E7E2] bg-white p-6 dark:border-[#1D2E26] dark:bg-[#111C17]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-[#E5E7E2] bg-white p-8 text-center text-sm text-[#B8860B] dark:border-[#1D2E26] dark:bg-[#111C17]">
            {error}
          </div>
        ) : (
          <div className="space-y-3">
            {surahDetail && surahDetail.number !== 1 && surahDetail.number !== 9 && (
              <div className="rounded-xl border border-[#E5E7E2] bg-white py-5 text-center dark:border-[#1D2E26] dark:bg-[#111C17]">
                <p
                  dir="rtl"
                  className="font-arabic text-2xl text-[#065F46] dark:text-[#D4AF37]"
                >
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              </div>
            )}

            {surahDetail?.ayahs.map((ayah, idx) => {
              const isActive = idx === activeAyahIndex;
              const isBookmarked = bookmarks.some(
                (b) =>
                  b.surahNumber === surahDetail.number &&
                  b.ayahNumber === ayah.numberInSurah
              );
              const existingNote = notes.find(
                (n) =>
                  n.surahNumber === surahDetail.number &&
                  n.ayahNumber === ayah.numberInSurah
              );

              return (
                <div
                  key={ayah.globalNumber}
                  ref={(el) => {
                    ayahRefs.current[ayah.numberInSurah] = el;
                  }}
                  className={`rounded-xl border p-6 transition-colors ${
                    isActive
                      ? "border-[#065F46] bg-[#065F46]/[0.03] dark:border-[#10B981] dark:bg-[#10B981]/[0.06]"
                      : "border-[#E5E7E2] bg-white dark:border-[#1D2E26] dark:bg-[#111C17]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-[#526058] dark:text-[#98A89E]">
                      <span className="font-mono-tabular font-semibold text-[#065F46] dark:text-[#10B981]">
                        {surahDetail.number}:{ayah.numberInSurah}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Juz {ayah.juz}</span>
                      <span aria-hidden="true">·</span>
                      <span>Page {ayah.page}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePlaySpecificAyah(idx)}
                        aria-label={`Play Ayah ${ayah.numberInSurah}`}
                        className={`rounded-md p-2 transition-colors ${
                          isActive && isPlaying
                            ? "text-[#065F46] dark:text-[#10B981]"
                            : "text-[#526058] hover:bg-[#FAFAF7] dark:text-[#98A89E] dark:hover:bg-[#192821]"
                        }`}
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteAyah(
                            editingNoteAyah === ayah.numberInSurah ? null : ayah.numberInSurah
                          );
                          setNoteDraft(existingNote?.note ?? "");
                        }}
                        aria-label={`Add note to Ayah ${ayah.numberInSurah}`}
                        className={`rounded-md p-2 transition-colors ${
                          existingNote
                            ? "text-[#B8860B] dark:text-[#D4AF37]"
                            : "text-[#526058] hover:bg-[#FAFAF7] dark:text-[#98A89E] dark:hover:bg-[#192821]"
                        }`}
                      >
                        <StickyNote className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleBookmark(idx)}
                        aria-label={`Bookmark Ayah ${ayah.numberInSurah}`}
                        className={`rounded-md p-2 transition-colors ${
                          isBookmarked
                            ? "text-[#065F46] dark:text-[#10B981]"
                            : "text-[#526058] hover:bg-[#FAFAF7] dark:text-[#98A89E] dark:hover:bg-[#192821]"
                        }`}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Traditional Arabic Naskh Script */}
                  <p
                    dir="rtl"
                    className="font-arabic mt-4 text-right text-2xl leading-[2.25] text-[#111815] sm:text-3xl dark:text-[#EEF2EF]"
                  >
                    {ayah.arabic}{" "}
                    <span className="font-mono-tabular inline-block text-sm text-[#B8860B] dark:text-[#D4AF37]">
                      ۝{ayah.numberInSurah}
                    </span>
                  </p>

                  {/* Translations */}
                  <div className="mt-4 space-y-2.5 border-t border-[#E5E7E2]/70 pt-4 dark:border-[#1D2E26]">
                    {(translationMode === "sahih" || translationMode === "both") && (
                      <div>
                        {translationMode === "both" && (
                          <span className="text-[11px] font-semibold text-[#065F46] dark:text-[#10B981]">
                            Sahih International
                          </span>
                        )}
                        <p className="text-sm leading-relaxed text-[#2C3832] dark:text-[#CBD5CE]">
                          {ayah.sahih}
                        </p>
                      </div>
                    )}

                    {(translationMode === "pickthall" || translationMode === "both") && (
                      <div>
                        {translationMode === "both" && (
                          <span className="text-[11px] font-semibold text-[#B8860B] dark:text-[#D4AF37]">
                            Pickthall
                          </span>
                        )}
                        <p className="text-sm leading-relaxed text-[#526058] dark:text-[#98A89E]">
                          {ayah.pickthall}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Personal Note Display / Editor */}
                  {existingNote && editingNoteAyah !== ayah.numberInSurah && (
                    <div className="mt-3 rounded-lg bg-[#FAFAF7] px-3.5 py-2.5 text-xs text-[#2C3832] dark:bg-[#0A110E] dark:text-[#CBD5CE]">
                      <span className="font-semibold text-[#B8860B] dark:text-[#D4AF37]">
                        Personal Note:{" "}
                      </span>
                      {existingNote.note}
                    </div>
                  )}

                  {editingNoteAyah === ayah.numberInSurah && (
                    <div className="mt-3 space-y-2 border-t border-[#E5E7E2] pt-3 dark:border-[#1D2E26]">
                      <textarea
                        rows={2}
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Write a reflection or tafsir note..."
                        className="w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] p-2.5 text-xs text-[#111815] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingNoteAyah(null)}
                          className="rounded-md px-3 py-1.5 text-xs text-[#526058] hover:text-[#111815] dark:text-[#98A89E]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveAyahNote(ayah.numberInSurah)}
                          className="rounded-md bg-[#065F46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#047857] dark:bg-[#059669]"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
