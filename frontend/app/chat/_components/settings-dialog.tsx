"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { toast } from "@/components/ui/swipe-toast";
import {
  IconSettings,
  IconDatabase,
  IconAdjustments,
  IconTrash,
  IconX,
  IconRotate2,
  IconCheck,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrubField } from "@/components/ui/scrub-field";
import { HoldButton } from "@/components/ui/hold-button";
import { useChat, DEFAULT_SETTINGS, ArkivSettings } from "./chat-context";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteAll: () => void;
}

type SettingsTab = "data" | "parameters";

interface ParameterConfig {
  key: keyof ArkivSettings;
  title: string;
  range: string;
  description: string;
  label: string;
  min: number;
  max: number;
  step: number;
  sensitivity: number;
  suffix: string;
}

const PARAMETERS: ParameterConfig[] = [
  {
    key: "top_k",
    title: "Top-K",
    range: "1 - 20",
    description: "Chunks retrieved per question",
    label: "K",
    min: 1,
    max: 20,
    step: 1,
    sensitivity: 8,
    suffix: "",
  },
  {
    key: "temperature",
    title: "Temperature",
    range: "0.0 - 1.0",
    description: "Creativity vs determinism",
    label: "Temp",
    min: 0.0,
    max: 1.0,
    step: 0.05,
    sensitivity: 8,
    suffix: "",
  },
  {
    key: "score_threshold",
    title: "Similarity Threshold",
    range: "0.0 - 1.0",
    description: "Minimum score to retain chunk",
    label: "Score",
    min: 0.0,
    max: 1.0,
    step: 0.05,
    sensitivity: 8,
    suffix: "",
  },
  {
    key: "chunk_size",
    title: "Chunk Size",
    range: "200 - 2,000",
    description: "Character length per chunk",
    label: "Size",
    min: 200,
    max: 2000,
    step: 50,
    sensitivity: 8,
    suffix: "ch",
  },
  {
    key: "chunk_overlap",
    title: "Chunk Overlap",
    range: "0 - 400",
    description: "Shared characters between chunks",
    label: "Overlap",
    min: 0,
    max: 400,
    step: 25,
    sensitivity: 8,
    suffix: "ch",
  },
];

interface SettingsModalContentProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onClose: () => void;
  onDeleteAll: () => void;
}

function SettingsModalContent({
  activeTab,
  onTabChange,
  onClose,
  onDeleteAll,
}: SettingsModalContentProps) {
  const { resolvedTheme } = useTheme();
  const { chats, settings, updateSettings, resetSettings, isDeletingAll } =
    useChat();

  const [draftSettings, setDraftSettings] =
    React.useState<ArkivSettings>(settings);

  const isDark = resolvedTheme === "dark";
  const chipColor = isDark ? "#27272a" : "#e4e4e7";
  const accentColor = isDark ? "#10b981" : "#059669";

  const handleUpdate = () => {
    updateSettings(draftSettings);
    toast.success("Parameters updated");
    onClose();
  };

  const handleReset = () => {
    setDraftSettings(DEFAULT_SETTINGS);
    resetSettings();
    toast.info("Reset to factory defaults");
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden sm:flex-row sm:divide-x divide-border">
      <div className="flex shrink-0 flex-col border-b border-border/50 bg-sidebar/80 backdrop-blur-xs sm:hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <IconSettings
              size={18}
              className="text-primary dark:text-emerald-400"
            />
            <DialogTitle className="font-mono text-sm font-bold tracking-wider">
              SETTINGS
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-muted size-8 rounded-full text-muted-foreground hover:text-foreground"
            title="Close Settings"
          >
            <IconX size={18} />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Mobile Horizontal Pill Tabs */}
        <div className="flex items-center gap-1.5 px-5 pb-3">
          <button
            type="button"
            onClick={() => onTabChange("parameters")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-mono text-sm font-medium transition-all",
              activeTab === "parameters"
                ? "bg-secondary text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            )}
          >
            Parameters
          </button>
          <button
            type="button"
            onClick={() => onTabChange("data")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-mono text-sm font-medium transition-all",
              activeTab === "data"
                ? "bg-secondary text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            )}
          >
            Data
          </button>
        </div>
      </div>

      {/* Desktop Left Sidebar Panel */}
      <aside className="bg-sidebar/50 hidden w-44 shrink-0 flex-col justify-between p-4 sm:flex">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <IconSettings
                size={20}
                className="text-primary dark:text-emerald-400"
              />
              <DialogTitle className="font-mono text-sm font-bold tracking-wider">
                SETTINGS
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-sidebar-accent size-8 rounded-[4px]"
              title="Close Settings"
            >
              <IconX size={18} />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <nav className="space-y-1.5">
            <Button
              variant="ghost"
              onClick={() => onTabChange("parameters")}
              className={cn(
                "h-10 w-full justify-start gap-2.5 rounded-[4px] px-3 font-mono text-sm font-semibold transition-colors",
                activeTab === "parameters"
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <IconAdjustments size={18} />
              <span>Parameters</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => onTabChange("data")}
              className={cn(
                "h-10 w-full justify-start gap-2.5 rounded-[4px] px-3 font-mono text-sm font-semibold transition-colors",
                activeTab === "data"
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <IconDatabase size={18} />
              <span>Data</span>
            </Button>
          </nav>
        </div>

        <div className="text-muted-foreground px-3 py-1.5 font-mono text-xs">
          Arkiv v2.7.0
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {activeTab === "data" && (
          <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden">
            {/* Desktop Header */}
            <div className="border-border hidden shrink-0 border-b p-6 pb-3 sm:block">
              <h3 className="font-mono text-xl font-bold tracking-wide">
                Data
              </h3>
              <DialogDescription className="sr-only">
                Data settings
              </DialogDescription>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-5">
              {/* Category section title (Claude style) */}
              <div className="text-muted-foreground font-mono text-xs font-semibold uppercase tracking-wider">
                Storage & Data Management
              </div>

              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-col justify-between gap-1.5 py-1 sm:flex-row sm:items-center sm:gap-4 sm:py-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-foreground font-mono text-sm font-medium">
                      Active Chat Sessions
                    </div>
                    <p className="text-muted-foreground mt-0.5 font-mono text-sm leading-relaxed">
                      Currently stored local sessions
                    </p>
                  </div>
                  <div className="border-border/80 bg-sidebar-accent text-primary dark:text-emerald-400 mt-1.5 inline-flex h-10 w-full shrink-0 items-center justify-center rounded-[4px] border font-mono text-sm font-bold tracking-wider select-none sm:mt-0 sm:w-32">
                    {chats.length} {chats.length === 1 ? "Session" : "Sessions"}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-1.5 py-1 sm:flex-row sm:items-center sm:gap-4 sm:py-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-destructive font-mono text-sm font-medium">
                      Delete All Data
                    </div>
                    <p className="text-muted-foreground mt-0.5 font-mono text-sm leading-relaxed">
                      Permanently wipe all session histories and documents
                    </p>
                  </div>

                  <HoldButton
                    glow={false}
                    fillColor="#dc2626"
                    backgroundColor={chipColor}
                    textColor={isDark ? "#f4f4f5" : "#18181b"}
                    fillTextColor="#ffffff"
                    size="md"
                    radius={4}
                    holdTime={1500}
                    releaseTime={200}
                    pressScale={0.97}
                    disabled={chats.length === 0 || isDeletingAll}
                    doneLabel="Deleted"
                    icon={<IconTrash size={16} />}
                    doneIcon={<IconCheck size={16} />}
                    className="border-border/80 hover:border-destructive/40 mt-1.5 h-10 w-full shrink-0 border font-mono text-sm font-bold tracking-wider transition-colors sm:mt-0 sm:w-32"
                    onHold={() => {
                      onDeleteAll();
                      onClose();
                    }}
                  >
                    {isDeletingAll ? "DELETING..." : "DELETE"}
                  </HoldButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "parameters" && (
          <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden">
            {/* Desktop Header */}
            <div className="border-border hidden shrink-0 border-b p-6 pb-3 sm:block">
              <h3 className="font-mono text-xl font-bold tracking-wide">
                Parameters
              </h3>
              <DialogDescription className="sr-only">
                Parameters settings
              </DialogDescription>
            </div>

            {/* Scrollable Parameters List */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-4">
              {/* Category section title (Claude style) */}
              <div className="text-muted-foreground font-mono text-xs font-semibold uppercase tracking-wider">
                Retrieval & Ingestion Parameters
              </div>

              <div className="space-y-4 sm:space-y-5">
                {PARAMETERS.map((param) => {
                  const val = draftSettings[param.key];
                  const defaultVal = DEFAULT_SETTINGS[param.key];

                  return (
                    <div
                      key={param.key}
                      className="flex flex-col justify-between gap-1.5 py-1 sm:flex-row sm:items-center sm:gap-4 sm:py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground font-mono text-sm font-medium">
                          {param.title}{" "}
                          <span className="text-muted-foreground text-xs font-normal">
                            ({param.range})
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 font-mono text-sm leading-relaxed">
                          {param.description}
                        </p>
                      </div>

                      <ScrubField
                        label={param.label}
                        suffix={param.suffix}
                        value={val}
                        defaultValue={defaultVal}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        sensitivity={param.sensitivity}
                        size="md"
                        accent={accentColor}
                        chipColor={chipColor}
                        className="border-border/80 hover:border-primary/40 mt-1.5 w-full shrink-0 border font-mono transition-colors sm:mt-0 sm:w-[180px]"
                        onChange={(v) =>
                          setDraftSettings((prev) => ({
                            ...prev,
                            [param.key]: v,
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="bg-sidebar/95 backdrop-blur-xs border-border/40 shrink-0 border-t px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-border bg-sidebar-accent text-foreground hover:bg-sidebar-accent/80 hover:text-foreground h-10 gap-2 rounded-[4px] px-4 font-mono text-sm font-bold tracking-wider shadow-none"
              >
                <IconRotate2 size={16} stroke={2.5} />
                <span>RESET</span>
              </Button>

              <Button
                onClick={handleUpdate}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 gap-2 rounded-[4px] px-5 font-mono text-sm font-bold tracking-wider"
              >
                <IconCheck size={16} stroke={2.5} />
                <span>UPDATE</span>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export function SettingsDialog({
  open,
  onOpenChange,
  onDeleteAll,
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("parameters");

  // 1. Listen for external hash changes (e.g. back/forward button or direct navigation)
  React.useEffect(() => {
    const handleHashChange = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("settings/data")) {
        setActiveTab("data");
        onOpenChange(true);
      } else if (
        hash.includes("settings/parameters") ||
        hash.includes("settings/patameters") ||
        hash === "#settings" ||
        hash === "#settings/"
      ) {
        setActiveTab("parameters");
        onOpenChange(true);
      } else if (hash === "" || !hash.includes("settings")) {
        onOpenChange(false);
      }
    };

    // Check once on initial mount
    const initialHash = window.location.hash.toLowerCase();
    if (initialHash.includes("settings")) {
      handleHashChange();
    }

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, [onOpenChange]);

  // 2. Synchronize URL hash when dialog open state or active tab changes
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (open) {
      const currentHash = window.location.hash.toLowerCase();
      const targetHash = `#settings/${activeTab}`;
      if (currentHash !== targetHash) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}${targetHash}`
        );
      }
    } else {
      if (window.location.hash.toLowerCase().includes("settings")) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`
        );
      }
    }
  }, [open, activeTab]);

  const handleTabChange = React.useCallback(
    (tab: SettingsTab) => {
      setActiveTab(tab);
      if (typeof window !== "undefined") {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}#settings/${tab}`
        );
      }
    },
    []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="border-border bg-sidebar flex h-[82vh] max-h-[620px] w-[92vw] max-w-md flex-col overflow-hidden rounded-2xl p-0 shadow-2xl sm:h-[490px] sm:w-[700px] sm:max-w-4xl sm:flex-row sm:rounded-[6px]"
      >
        {open && (
          <SettingsModalContent
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onClose={() => onOpenChange(false)}
            onDeleteAll={onDeleteAll}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
