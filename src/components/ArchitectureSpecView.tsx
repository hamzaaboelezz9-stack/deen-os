import { useState } from "react";
import { Check, Copy, Moon, Sun } from "lucide-react";
import {
  ARCHITECTURE_NODES,
  DESIGN_TOKENS,
  FIRESTORE_SCHEMA,
  FOLDER_STRUCTURE,
  IMPLEMENTATION_ROADMAP,
  SQL_SCHEMA,
} from "../data/architectureSpec";

interface ArchitectureSpecViewProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

type SpecSection = "arch" | "folder" | "design" | "schema" | "roadmap";

export function ArchitectureSpecView({
  theme,
  onToggleTheme,
}: ArchitectureSpecViewProps) {
  const [section, setSection] = useState<SpecSection>("arch");
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    ARCHITECTURE_NODES[0].id
  );
  const [schemaFormat, setSchemaFormat] = useState<"sql" | "firestore">("sql");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copyText(key: string, value: string) {
    navigator.clipboard?.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  }

  const activeNode =
    ARCHITECTURE_NODES.find((n) => n.id === selectedNodeId) ?? ARCHITECTURE_NODES[0];

  return (
    <div className="space-y-6">
      {/* Header + Segmented Section Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7E2] pb-4 dark:border-[#1D2E26]">
        <div>
          <h1 className="text-xl font-bold text-[#111815] dark:text-[#EEF2EF]">
            DeenOS Technical Specification &amp; System Blueprint
          </h1>
          <p className="text-xs text-[#526058] dark:text-[#98A89E]">
            Flutter Clean Architecture · Firebase &amp; Supabase Schema · Emerald &amp; Gold Design System · 12-Week Roadmap
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#EFEFE9] p-1 dark:bg-[#111C17]">
          {(
            [
              { id: "arch", label: "01. Architecture" },
              { id: "folder", label: "02. Codebase" },
              { id: "design", label: "03. Design System" },
              { id: "schema", label: "04. Database" },
              { id: "roadmap", label: "05. Roadmap" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`min-h-[36px] shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                section === item.id
                  ? "bg-white text-[#065F46] shadow-xs dark:bg-[#064E3B] dark:text-white"
                  : "text-[#526058] hover:text-[#111815] dark:text-[#98A89E] dark:hover:text-[#EEF2EF]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 01. HIGH-LEVEL ARCHITECTURAL DIAGRAM */}
      {section === "arch" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-[#E5E7E2] bg-white p-6 lg:col-span-8 dark:border-[#1D2E26] dark:bg-[#111C17]">
            <h2 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
              High-Level System Architecture
            </h2>
            <p className="mt-0.5 text-xs text-[#526058] dark:text-[#98A89E]">
              Click any architectural node below to inspect protocols, caching, and offline guarantees.
            </p>

            {/* Interactive SVG System Diagram */}
            <div className="mt-6 overflow-x-auto">
              <svg viewBox="0 0 760 360" className="min-w-[620px] w-full">
                {/* Connectors */}
                <path
                  d="M210 95 L290 145 M210 250 L210 145 M290 175 L465 110 M290 185 L465 255 M465 175 L560 175"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  fill="none"
                  className="text-[#CBD5CE] dark:text-[#2A4035]"
                />
                {/* Direct arrows */}
                <line
                  x1="210"
                  y1="145"
                  x2="210"
                  y2="205"
                  stroke="#065F46"
                  strokeWidth="2"
                />
                <line
                  x1="245"
                  y1="95"
                  x2="295"
                  y2="165"
                  stroke="#065F46"
                  strokeWidth="2"
                />
                <line
                  x1="465"
                  y1="165"
                  x2="530"
                  y2="95"
                  stroke="#B8860B"
                  strokeWidth="2"
                />
                <line
                  x1="465"
                  y1="190"
                  x2="530"
                  y2="260"
                  stroke="#065F46"
                  strokeWidth="2"
                />

                {/* Node 1: Flutter Client */}
                <g
                  onClick={() => setSelectedNodeId("flutter-app")}
                  className="cursor-pointer"
                >
                  <rect
                    x="20"
                    y="45"
                    width="225"
                    height="95"
                    rx="10"
                    fill={selectedNodeId === "flutter-app" ? "#065F46" : "#FAFAF7"}
                    stroke={selectedNodeId === "flutter-app" ? "#D4AF37" : "#CBD5CE"}
                    strokeWidth="1.5"
                  />
                  <text
                    x="36"
                    y="73"
                    fill={selectedNodeId === "flutter-app" ? "#FDE68A" : "#065F46"}
                    fontSize="11"
                    fontWeight="600"
                  >
                    CLIENT LAYER
                  </text>
                  <text
                    x="36"
                    y="95"
                    fill={selectedNodeId === "flutter-app" ? "#FFFFFF" : "#111815"}
                    fontSize="15"
                    fontWeight="700"
                  >
                    DeenOS Flutter App
                  </text>
                  <text
                    x="36"
                    y="116"
                    fill={selectedNodeId === "flutter-app" ? "#E2E8F0" : "#526058"}
                    fontSize="11"
                  >
                    Riverpod · Sensors · JustAudio
                  </text>
                </g>

                {/* Node 2: Local Offline DB */}
                <g
                  onClick={() => setSelectedNodeId("local-storage")}
                  className="cursor-pointer"
                >
                  <rect
                    x="20"
                    y="205"
                    width="225"
                    height="95"
                    rx="10"
                    fill={selectedNodeId === "local-storage" ? "#065F46" : "#FAFAF7"}
                    stroke={selectedNodeId === "local-storage" ? "#D4AF37" : "#CBD5CE"}
                    strokeWidth="1.5"
                  />
                  <text
                    x="36"
                    y="233"
                    fill={selectedNodeId === "local-storage" ? "#FDE68A" : "#B8860B"}
                    fontSize="11"
                    fontWeight="600"
                  >
                    OFFLINE PERSISTENCE
                  </text>
                  <text
                    x="36"
                    y="255"
                    fill={selectedNodeId === "local-storage" ? "#FFFFFF" : "#111815"}
                    fontSize="15"
                    fontWeight="700"
                  >
                    Drift SQLite + FTS5
                  </text>
                  <text
                    x="36"
                    y="276"
                    fill={selectedNodeId === "local-storage" ? "#E2E8F0" : "#526058"}
                    fontSize="11"
                  >
                    Quran Corpus · Audio Cache
                  </text>
                </g>

                {/* Node 3: Edge Gateway */}
                <g
                  onClick={() => setSelectedNodeId("api-gateway")}
                  className="cursor-pointer"
                >
                  <rect
                    x="295"
                    y="125"
                    width="175"
                    height="105"
                    rx="10"
                    fill={selectedNodeId === "api-gateway" ? "#065F46" : "#FAFAF7"}
                    stroke={selectedNodeId === "api-gateway" ? "#D4AF37" : "#CBD5CE"}
                    strokeWidth="1.5"
                  />
                  <text
                    x="311"
                    y="153"
                    fill={selectedNodeId === "api-gateway" ? "#FDE68A" : "#065F46"}
                    fontSize="11"
                    fontWeight="600"
                  >
                    EDGE BFF PROXY
                  </text>
                  <text
                    x="311"
                    y="175"
                    fill={selectedNodeId === "api-gateway" ? "#FFFFFF" : "#111815"}
                    fontSize="15"
                    fontWeight="700"
                  >
                    Express / Cloud Run
                  </text>
                  <text
                    x="311"
                    y="196"
                    fill={selectedNodeId === "api-gateway" ? "#E2E8F0" : "#526058"}
                    fontSize="11"
                  >
                    Secret Isolation · Cache
                  </text>
                </g>

                {/* Node 4: Firebase / Supabase */}
                <g
                  onClick={() => setSelectedNodeId("firebase-backend")}
                  className="cursor-pointer"
                >
                  <rect
                    x="525"
                    y="45"
                    width="215"
                    height="95"
                    rx="10"
                    fill={selectedNodeId === "firebase-backend" ? "#065F46" : "#FAFAF7"}
                    stroke={selectedNodeId === "firebase-backend" ? "#D4AF37" : "#CBD5CE"}
                    strokeWidth="1.5"
                  />
                  <text
                    x="541"
                    y="73"
                    fill={selectedNodeId === "firebase-backend" ? "#FDE68A" : "#B8860B"}
                    fontSize="11"
                    fontWeight="600"
                  >
                    STATE &amp; AUTH
                  </text>
                  <text
                    x="541"
                    y="95"
                    fill={selectedNodeId === "firebase-backend" ? "#FFFFFF" : "#111815"}
                    fontSize="15"
                    fontWeight="700"
                  >
                    Firebase / Supabase
                  </text>
                  <text
                    x="541"
                    y="116"
                    fill={selectedNodeId === "firebase-backend" ? "#E2E8F0" : "#526058"}
                    fontSize="11"
                  >
                    Auth · Bookmarks · Logs
                  </text>
                </g>

                {/* Node 5: External APIs & Gemini */}
                <g
                  onClick={() => setSelectedNodeId("external-apis")}
                  className="cursor-pointer"
                >
                  <rect
                    x="525"
                    y="205"
                    width="215"
                    height="95"
                    rx="10"
                    fill={selectedNodeId === "external-apis" ? "#065F46" : "#FAFAF7"}
                    stroke={selectedNodeId === "external-apis" ? "#D4AF37" : "#CBD5CE"}
                    strokeWidth="1.5"
                  />
                  <text
                    x="541"
                    y="233"
                    fill={selectedNodeId === "external-apis" ? "#FDE68A" : "#065F46"}
                    fontSize="11"
                    fontWeight="600"
                  >
                    UPSTREAM APIS &amp; AI
                  </text>
                  <text
                    x="541"
                    y="255"
                    fill={selectedNodeId === "external-apis" ? "#FFFFFF" : "#111815"}
                    fontSize="15"
                    fontWeight="700"
                  >
                    Aladhan · Quran · Gemini
                  </text>
                  <text
                    x="541"
                    y="276"
                    fill={selectedNodeId === "external-apis" ? "#E2E8F0" : "#526058"}
                    fontSize="11"
                  >
                    Maps Places · Spot Metals
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Node Inspector */}
          <div className="rounded-xl border border-[#E5E7E2] bg-white p-6 lg:col-span-4 dark:border-[#1D2E26] dark:bg-[#111C17]">
            <p className="text-xs font-semibold text-[#B8860B] dark:text-[#D4AF37]">
              Selected Component
            </p>
            <h3 className="mt-1 text-lg font-bold text-[#111815] dark:text-[#EEF2EF]">
              {activeNode.title}
            </h3>
            <p className="text-xs text-[#526058] dark:text-[#98A89E]">
              {activeNode.subtitle}
            </p>

            <div className="mt-3 border-y border-[#E5E7E2] py-2.5 text-xs font-mono-tabular text-[#065F46] dark:border-[#1D2E26] dark:text-[#10B981]">
              {activeNode.tech}
            </div>

            <ul className="mt-4 space-y-3 text-xs leading-relaxed text-[#2C3832] dark:text-[#CBD5CE]">
              {activeNode.details.map((detail, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="font-mono-tabular font-semibold text-[#065F46] dark:text-[#10B981]">
                    0{idx + 1}.
                  </span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 02. FOLDER STRUCTURE */}
      {section === "folder" && (
        <div className="rounded-xl border border-[#E5E7E2] bg-white p-6 dark:border-[#1D2E26] dark:bg-[#111C17]">
          <div className="flex items-center justify-between gap-4 border-b border-[#E5E7E2] pb-4 dark:border-[#1D2E26]">
            <div>
              <h2 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
                Feature-First Clean Architecture Monorepo
              </h2>
              <p className="text-xs text-[#526058] dark:text-[#98A89E]">
                Decoupled Flutter mobile features, Drift offline layer, and Node/Cloud Functions BFF
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyText("folder", FOLDER_STRUCTURE)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E7E2] px-3 text-xs font-semibold text-[#111815] hover:border-[#065F46] dark:border-[#1D2E26] dark:text-[#EEF2EF]"
            >
              {copiedKey === "folder" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#065F46]" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Tree
                </>
              )}
            </button>
          </div>
          <pre className="font-mono-tabular mt-4 overflow-x-auto rounded-lg bg-[#0A110E] p-5 text-xs leading-relaxed text-[#D7E3DC]">
            {FOLDER_STRUCTURE}
          </pre>
        </div>
      )}

      {/* 03. UI/UX DESIGN SYSTEM */}
      {section === "design" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E5E7E2] bg-white p-6 dark:border-[#1D2E26] dark:bg-[#111C17]">
            <div>
              <h2 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
                Emerald Green &amp; Burnished Gold Design System
              </h2>
              <p className="text-xs text-[#526058] dark:text-[#98A89E]">
                60-30-10 surface hierarchy balancing serene alabaster/obsidian canvases with high-contrast sacred typography.
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#065F46] px-4 text-xs font-semibold text-white hover:bg-[#047857] dark:bg-[#059669]"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-3.5 w-3.5" /> Preview Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5" /> Preview Dark Mode
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DESIGN_TOKENS.colors.map((c) => (
              <div
                key={c.name}
                className="rounded-xl border border-[#E5E7E2] bg-white p-4 dark:border-[#1D2E26] dark:bg-[#111C17]"
              >
                <div
                  className="h-14 w-full rounded-lg border border-black/10"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold text-[#111815] dark:text-[#EEF2EF]">
                    {c.name}
                  </p>
                  <span className="font-mono-tabular text-[11px] text-[#526058] dark:text-[#98A89E]">
                    {c.hex}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#526058] dark:text-[#98A89E]">
                  {c.role} · {c.contrast}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[#E5E7E2] bg-white p-6 dark:border-[#1D2E26] dark:bg-[#111C17]">
            <h3 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
              Typography Specimens
            </h3>
            <div className="mt-4 divide-y divide-[#E5E7E2] dark:divide-[#1D2E26]">
              {DESIGN_TOKENS.typography.map((t) => (
                <div key={t.role} className="py-5 first:pt-2 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#526058] dark:text-[#98A89E]">
                    <span className="font-semibold text-[#065F46] dark:text-[#10B981]">
                      {t.role}
                    </span>
                    <span>
                      {t.family} · {t.weights}
                    </span>
                  </div>
                  <p
                    dir={t.isArabic ? "rtl" : "ltr"}
                    className={`mt-3 text-[#111815] dark:text-[#EEF2EF] ${
                      t.isArabic
                        ? "font-arabic text-right text-2xl sm:text-3xl leading-[2.1]"
                        : t.isMono
                          ? "font-mono-tabular text-base sm:text-lg"
                          : "text-xl font-semibold sm:text-2xl"
                    }`}
                  >
                    {t.sample}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 04. DATABASE SCHEMA */}
      {section === "schema" && (
        <div className="rounded-xl border border-[#E5E7E2] bg-white p-6 dark:border-[#1D2E26] dark:bg-[#111C17]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7E2] pb-4 dark:border-[#1D2E26]">
            <div>
              <h2 className="text-base font-semibold text-[#111815] dark:text-[#EEF2EF]">
                Database Schema (Users, Bookmarks, Tasbih Logs, Zakat)
              </h2>
              <p className="text-xs text-[#526058] dark:text-[#98A89E]">
                Switch between PostgreSQL (Supabase) DDL and Cloud Firestore NoSQL + Security Rules
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-[#FAFAF7] p-1 dark:bg-[#0A110E]">
                <button
                  type="button"
                  onClick={() => setSchemaFormat("sql")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    schemaFormat === "sql"
                      ? "bg-white text-[#065F46] shadow-xs dark:bg-[#111C17] dark:text-[#10B981]"
                      : "text-[#526058] dark:text-[#98A89E]"
                  }`}
                >
                  PostgreSQL / Supabase
                </button>
                <button
                  type="button"
                  onClick={() => setSchemaFormat("firestore")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    schemaFormat === "firestore"
                      ? "bg-white text-[#065F46] shadow-xs dark:bg-[#111C17] dark:text-[#10B981]"
                      : "text-[#526058] dark:text-[#98A89E]"
                  }`}
                >
                  Firestore + Rules
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyText("schema", schemaFormat === "sql" ? SQL_SCHEMA : FIRESTORE_SCHEMA)
                }
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E5E7E2] px-3 text-xs font-semibold text-[#111815] hover:border-[#065F46] dark:border-[#1D2E26] dark:text-[#EEF2EF]"
              >
                {copiedKey === "schema" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#065F46]" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <pre className="font-mono-tabular mt-4 overflow-x-auto rounded-lg bg-[#0A110E] p-5 text-xs leading-relaxed text-[#D7E3DC]">
            {schemaFormat === "sql" ? SQL_SCHEMA : FIRESTORE_SCHEMA}
          </pre>
        </div>
      )}

      {/* 05. IMPLEMENTATION ROADMAP */}
      {section === "roadmap" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {IMPLEMENTATION_ROADMAP.map((item) => (
            <div
              key={item.phase}
              className="rounded-xl border border-[#E5E7E2] bg-white p-6 dark:border-[#1D2E26] dark:bg-[#111C17]"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono-tabular font-semibold text-[#B8860B] dark:text-[#D4AF37]">
                  {item.phase}
                </span>
                <span className="text-[#526058] dark:text-[#98A89E]">{item.status}</span>
              </div>
              <h3 className="mt-1.5 text-base font-bold text-[#111815] dark:text-[#EEF2EF]">
                {item.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-[#2C3832] dark:text-[#CBD5CE]">
                {item.deliverables.map((deliv, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono-tabular font-semibold text-[#065F46] dark:text-[#10B981]">
                      •
                    </span>
                    <span>{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
