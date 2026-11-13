import { useState } from "react";
import { Compass, MapPin, Moon, Search, Sun, X } from "lucide-react";
import { PRESET_LOCATIONS } from "../data/islamicContent";
import { LocationState } from "../types/deenos";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationState;
  onSelectLocation: (loc: LocationState) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function LocationModal({
  isOpen,
  onClose,
  location,
  onSelectLocation,
  theme,
  onToggleTheme,
}: LocationModalProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ name: string; fullName: string; lat: number; lng: number }>
  >([]);
  const [searching, setSearching] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setGpsStatus(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSearchResults(data);
      }
    } catch {
      setGpsStatus("Unable to search city coordinates right now.");
    } finally {
      setSearching(false);
    }
  }

  function handleDetectGps() {
    if (!("geolocation" in navigator)) {
      setGpsStatus("Browser geolocation is not supported in this environment.");
      return;
    }
    setGpsStatus("Requesting GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSelectLocation({
          city: "Current GPS",
          country: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: "gps",
        });
        setGpsStatus(null);
        onClose();
      },
      () => {
        setGpsStatus("Location permission denied or unavailable. Select a city below.");
      },
      { timeout: 8000 }
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-xl border border-[#E5E7E2] bg-white p-6 shadow-xl dark:border-[#1D2E26] dark:bg-[#111C17]">
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7E2] pb-4 dark:border-[#1D2E26]">
          <div>
            <h2
              id="location-modal-title"
              className="text-lg font-semibold text-[#111815] dark:text-[#EEF2EF]"
            >
              Location & Appearance
            </h2>
            <p className="mt-0.5 text-xs text-[#526058] dark:text-[#98A89E]">
              Synchronizes Prayer Times, Qibla Azimuth, and Nearby Halal Finder
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#526058] transition-colors hover:bg-[#FAFAF7] hover:text-[#111815] dark:text-[#98A89E] dark:hover:bg-[#192821] dark:hover:text-[#EEF2EF]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* GPS + Theme row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleDetectGps}
              className="flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#065F46] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#047857] dark:bg-[#059669] dark:hover:bg-[#10B981] dark:hover:text-[#052E22]"
            >
              <Compass className="h-4 w-4" />
              <span>Use GPS Location</span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className="flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-4 py-2 text-xs font-semibold text-[#111815] transition-colors hover:border-[#065F46]/40 dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4 text-[#D4AF37]" />
                  <span>Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-[#065F46]" />
                  <span>Switch to Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {gpsStatus && (
            <p className="text-xs text-[#B8860B] dark:text-[#D4AF37]">{gpsStatus}</p>
          )}

          {/* City search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7A71]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any city worldwide (e.g., Tokyo, Paris)"
                className="h-10 w-full rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] pl-9 pr-3 text-sm text-[#111815] placeholder:text-[#6B7A71] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="h-10 shrink-0 rounded-lg border border-[#E5E7E2] px-4 text-xs font-semibold text-[#111815] transition-colors hover:border-[#065F46] disabled:opacity-50 dark:border-[#1D2E26] dark:text-[#EEF2EF]"
            >
              {searching ? "Searching..." : "Find"}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-1 border-t border-[#E5E7E2] pt-3 dark:border-[#1D2E26]">
              <p className="text-xs font-medium text-[#526058] dark:text-[#98A89E]">
                Search Results
              </p>
              <div className="max-h-36 space-y-1 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    key={`${item.name}-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelectLocation({
                        city: item.name.split(",")[0].trim(),
                        country: item.name.split(",")[1]?.trim() || "Custom",
                        lat: item.lat,
                        lng: item.lng,
                        source: "search",
                      });
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-[#FAFAF7] dark:hover:bg-[#192821]"
                  >
                    <span className="font-medium text-[#111815] dark:text-[#EEF2EF]">
                      {item.fullName}
                    </span>
                    <span className="font-mono-tabular shrink-0 pl-2 text-[#526058] dark:text-[#98A89E]">
                      {item.lat.toFixed(2)}, {item.lng.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Global Presets */}
          <div>
            <p className="mb-2 text-xs font-medium text-[#526058] dark:text-[#98A89E]">
              Major Islamic & Global Cities
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_LOCATIONS.map((preset) => {
                const isSelected =
                  location.city === preset.city &&
                  Math.abs(location.lat - preset.lat) < 0.05;
                return (
                  <button
                    key={preset.city}
                    type="button"
                    onClick={() => {
                      onSelectLocation(preset);
                      onClose();
                    }}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? "border-[#065F46] bg-[#065F46]/5 text-[#065F46] dark:border-[#10B981] dark:bg-[#10B981]/10 dark:text-[#10B981]"
                        : "border-[#E5E7E2] text-[#111815] hover:border-[#065F46]/40 dark:border-[#1D2E26] dark:text-[#EEF2EF]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                      {preset.city}
                    </span>
                    <span className="text-[11px] text-[#6B7A71] dark:text-[#98A89E]">
                      {preset.country}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
