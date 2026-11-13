import { MapPin } from "lucide-react";
import { LocationState, PrimaryTab } from "../types/deenos";

interface TopBarProps {
  activeTab: PrimaryTab;
  onSelectTab: (tab: PrimaryTab) => void;
  location: LocationState;
  onOpenLocation: () => void;
}

const NAV_ITEMS: Array<{ id: PrimaryTab; label: string }> = [
  { id: "prayer", label: "Prayer" },
  { id: "quran", label: "Quran" },
  { id: "tools", label: "Tools" },
  { id: "assistant", label: "Assistant" },
  { id: "spec", label: "Blueprint" },
];

export function TopBar({
  activeTab,
  onSelectTab,
  location,
  onOpenLocation,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7E2] bg-[#FAFAF7]/95 backdrop-blur-md dark:border-[#1D2E26] dark:bg-[#0A110E]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab("prayer")}
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#065F46]"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-[#065F46] dark:text-[#10B981]"
          >
            <rect
              x="5"
              y="5"
              width="14"
              height="14"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <rect
              x="5"
              y="5"
              width="14"
              height="14"
              transform="rotate(45 12 12)"
              stroke="#B8860B"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="12" r="2.2" fill="currentColor" />
          </svg>
          <span className="text-lg font-bold tracking-tight text-[#111815] dark:text-[#EEF2EF]">
            DeenOS
          </span>
        </button>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative shrink-0 whitespace-nowrap py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#065F46] ${
                  isActive
                    ? "text-[#065F46] dark:text-[#10B981]"
                    : "text-[#526058] hover:text-[#111815] dark:text-[#98A89E] dark:hover:text-[#EEF2EF]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[19px] h-0.5 bg-[#065F46] dark:bg-[#10B981]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onOpenLocation}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-[#065F46] px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#047857] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46] dark:bg-[#059669] dark:hover:bg-[#10B981] dark:hover:text-[#052E22]"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="max-w-[140px] truncate">{location.city}</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Strip */}
      <nav
        aria-label="Mobile navigation"
        className="flex items-center justify-between gap-1 overflow-x-auto border-t border-[#E5E7E2] px-3 py-1.5 md:hidden dark:border-[#1D2E26]"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`min-h-[36px] shrink-0 whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#065F46]/10 text-[#065F46] dark:bg-[#10B981]/15 dark:text-[#10B981]"
                  : "text-[#526058] dark:text-[#98A89E]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
