import { useEffect, useState } from "react";
import { ArchitectureSpecView } from "./components/ArchitectureSpecView";
import { AssistantView } from "./components/AssistantView";
import { LocationModal } from "./components/LocationModal";
import { PrayerQiblaView } from "./components/PrayerQiblaView";
import { QuranView } from "./components/QuranView";
import { ToolsHubView } from "./components/ToolsHubView";
import { TopBar } from "./components/TopBar";
import { PRESET_LOCATIONS } from "./data/islamicContent";
import { LocationState, PrimaryTab } from "./types/deenos";

export default function App() {
  const [activeTab, setActiveTab] = useState<PrimaryTab>("prayer");
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("deenos_theme");
    return saved === "dark" ? "dark" : "light";
  });

  const [location, setLocation] = useState<LocationState>(() => {
    try {
      const saved = localStorage.getItem("deenos_location");
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback to default city
    }
    return PRESET_LOCATIONS[2]; // London default
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("deenos_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("deenos_location", JSON.stringify(location));
  }, [location]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111815] transition-colors duration-150 dark:bg-[#0A110E] dark:text-[#EEF2EF]">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        location={location}
        onOpenLocation={() => setLocationModalOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "prayer" && (
          <PrayerQiblaView
            location={location}
            onOpenLocation={() => setLocationModalOpen(true)}
          />
        )}

        {activeTab === "quran" && <QuranView />}

        {activeTab === "tools" && (
          <ToolsHubView
            location={location}
            onOpenLocation={() => setLocationModalOpen(true)}
          />
        )}

        {activeTab === "assistant" && <AssistantView />}

        {activeTab === "spec" && (
          <ArchitectureSpecView
            theme={theme}
            onToggleTheme={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
          />
        )}
      </main>

      <footer className="border-t border-[#E5E7E2] py-6 text-xs text-[#526058] dark:border-[#1D2E26] dark:text-[#98A89E]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <p>
            DeenOS · Emerald &amp; Gold Minimalist Islamic Workspace
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              className="hover:text-[#065F46] dark:hover:text-[#10B981]"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("spec")}
              className="hover:text-[#065F46] dark:hover:text-[#10B981]"
            >
              System Architecture &amp; Schema
            </button>
          </div>
        </div>
      </footer>

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        location={location}
        onSelectLocation={setLocation}
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === "dark" ? "light" : "dark"))
        }
      />
    </div>
  );
}
