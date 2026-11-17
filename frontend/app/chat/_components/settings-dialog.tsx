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
    suffix: "ch",
  },
];

interface SettingsModalContentProps {
  onClose: () => void;
  onDeleteAll: () => void;
}

function SettingsModalContent({
  onClose,
  onDeleteAll,
}: SettingsModalContentProps) {
  const { resolvedTheme } = useTheme();
  const { chats, settings, updateSettings, resetSettings, isDeletingAll } =
    useChat();

  const [activeTab, setActiveTab] = React.useState<SettingsTab>("parameters");
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
    <div className="divide-border flex h-[490px] w-full divide-x">
      {/* Left Panel: Settings Navigation */}
      <aside className="bg-sidebar/50 flex w-44 shrink-0 flex-col justify-between p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <IconSettings
                size={20}
                className="text-primary dark:text-emerald-400"
              />
              <DialogTitle className="font-mono text-sm font-bold tracking-wider">
                Settings
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
              onClick={() => setActiveTab("data")}
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

            <Button
              variant="ghost"
              onClick={() => setActiveTab("parameters")}
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
          </nav>
        </div>

        <div className="text-muted-foreground px-3 py-1.5 font-mono text-xs">
          Arkiv v2.7.0
        </div>
      </aside>

      {/* Right Panel: Content Area */}
      <main className="flex min-w-0 flex-1 flex-col justify-between p-6">
        {activeTab === "data" && (
          <div className="flex h-full flex-col justify-between">
            <div className="space-y-5">
              <div className="border-border border-b pb-3">
                <h3 className="font-mono text-xl font-bold tracking-wide">
                  Data
                </h3>
                <DialogDescription className="sr-only">
                  Data settings
                </DialogDescription>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4 py-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-foreground font-mono text-sm font-bold">
                      Active Chat Sessions
                    </div>
                    <p className="text-muted-foreground mt-1 font-mono text-xs">
                      Currently stored local sessions
                    </p>
                  </div>
                  <div className="border-border/80 bg-sidebar-accent text-primary inline-flex h-10 w-32 shrink-0 items-center justify-center rounded-[4px] border font-mono text-sm font-bold select-none dark:text-emerald-400">
                    {chats.length} {chats.length === 1 ? "Session" : "Sessions"}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 py-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-destructive font-mono text-sm font-bold">
                      Delete All Data
                    </div>
                    <p className="text-muted-foreground mt-1 font-mono text-xs">
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
                    className="border-border/80 hover:border-destructive/40 w-32 shrink-0 border transition-colors"
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
          <div className="flex h-full flex-col justify-between">
            <div className="space-y-4">
              <div className="border-border border-b pb-3">
                <h3 className="font-mono text-xl font-bold tracking-wide">
                  Parameters
                </h3>
                <DialogDescription className="sr-only">
                  Parameters settings
                </DialogDescription>
              </div>

              <div className="space-y-4">
                {PARAMETERS.map((param) => {
                  const val = draftSettings[param.key];
                  const defaultVal = DEFAULT_SETTINGS[param.key];

                  return (
                    <div
                      key={param.key}
                      className="flex items-center justify-between gap-4 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground font-mono text-sm font-bold">
                          {param.title}{" "}
                          <span className="text-muted-foreground text-xs font-normal">
                            ({param.range})
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1 font-mono text-xs">
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
                        sensitivity={2}
                        size="md"
                        width={180}
                        accent={accentColor}
                        chipColor={chipColor}
                        className="border-border/80 hover:border-primary/40 shrink-0 border font-mono transition-colors"
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

            {/* Footer Buttons: RESET and UPDATE */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-border bg-sidebar-accent text-foreground hover:bg-sidebar-accent/80 hover:text-foreground h-10 gap-2 rounded-[4px] px-4 font-mono text-sm font-bold tracking-wider shadow-none"
              >
                <IconRotate2 size={16} />
                <span>RESET</span>
              </Button>

              <Button
                onClick={handleUpdate}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 gap-2 rounded-[4px] px-5 font-mono text-sm font-bold tracking-wider"
              >
                <IconCheck size={16} />
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="border-border bg-sidebar w-[95vw] max-w-4xl overflow-hidden rounded-[4px] p-0 shadow-2xl sm:w-[700px]"
      >
        {open && (
          <SettingsModalContent
            onClose={() => onOpenChange(false)}
            onDeleteAll={onDeleteAll}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
