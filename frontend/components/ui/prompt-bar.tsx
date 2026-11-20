"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  IconAdjustmentsHorizontal,
  IconArrowUp,
  IconFileTextSpark,
  IconRotate2,
  IconSquare,
} from "@tabler/icons-react";
import { VoicePill } from "@/components/ui/voice-pill";
import { ElasticSlider } from "@/components/ui/elastic-slider";
import { useSpeechRecognition } from "@/hooks/use-speech-recog";
import { cn } from "@/lib/utils";

export interface PromptBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  busy?: boolean;
  onSend?: (text: string) => void;
  onStop?: () => void;
  onSummarize?: () => void;
  onDictate?: boolean;
  topK?: number;
  temperature?: number;
  scoreThreshold?: number;
  onParamChange?: (
    key: "top_k" | "temperature" | "score_threshold",
    val: number
  ) => void;
  className?: string;
}

const DEFAULT_TOP_K = 10;
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_SCORE_THRESHOLD = 0.45;

const COMMANDS = [
  { name: "/summarize", description: "Summarize the uploaded documents" },
  { name: "/explain", description: "Explain key concepts from documents" },
  { name: "/compare", description: "Compare topics across documents" },
];

export function PromptBar({
  placeholder = "Ask Arkiv...",
  value,
  onChange,
  busy = false,
  onSend,
  onStop,
  onSummarize,
  onDictate,
  topK = DEFAULT_TOP_K,
  temperature = DEFAULT_TEMPERATURE,
  scoreThreshold = DEFAULT_SCORE_THRESHOLD,
  onParamChange,
  className = "",
}: PromptBarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const baseDraftRef = useRef("");

  const [internalDraft, setInternalDraft] = useState("");
  const isControlled = value !== undefined;
  const draft = isControlled ? value : internalDraft;

  const setDraft = (val: string) => {
    if (!isControlled) setInternalDraft(val);
    onChange?.(val);
  };

  const [paramsOpen, setParamsOpen] = useState(false);

  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      const base = baseDraftRef.current;
      const separator = base ? " " : "";
      setDraft(`${base}${separator}${transcript}`);
    },
  });

  const slashMatch = /(^|\s)\/([a-z0-9_-]*)$/i.exec(draft);
  const slashQuery = slashMatch ? slashMatch[2].toLowerCase() : null;
  const showCommands = slashQuery !== null;
  const filteredCommands = showCommands
    ? COMMANDS.filter((c) =>
        c.name.replace(/^\//, "").toLowerCase().startsWith(slashQuery)
      )
    : [];
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);

  const canSend = draft.trim().length > 0;
  const armed = busy || canSend;

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });

  useEffect(() => {
    if (!paramsOpen) return undefined;
    const onDown = (e: globalThis.PointerEvent) => {
      if (
        !popoverRef.current?.contains(e.target as Node) &&
        !rootRef.current?.contains(e.target as Node)
      ) {
        setParamsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [paramsOpen]);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    const max = 110;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [draft]);

  const send = () => {
    if (!canSend || busy) return;
    if (isListening) stopListening();
    onSend?.(draft.trim());
    setDraft("");
    setParamsOpen(false);
    focusInput();
  };

  const handleVoiceStart = () => {
    baseDraftRef.current = draft.trim();
    startListening();
  };

  const handleVoiceStop = () => {
    stopListening();
    focusInput();
  };

  useEffect(() => {
    if (busy && isListening) {
      stopListening();
    }
  }, [busy, isListening, stopListening]);

  const pickCommand = (cmdName: string) => {
    if (!slashMatch) return;
    const head = draft.slice(0, slashMatch.index + slashMatch[1].length);
    setDraft(`${head}${cmdName} `);
    focusInput();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommands && filteredCommands.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveCommandIndex((prev) => (prev + 1) % filteredCommands.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveCommandIndex((prev) =>
          prev === 0 ? filteredCommands.length - 1 : prev - 1
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pickCommand(filteredCommands[activeCommandIndex]?.name);
        return;
      }
    }
    if (e.key === "Escape") {
      setParamsOpen(false);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "bg-neutral-200/70 dark:bg-neutral-800/80 hover:bg-neutral-200/90 dark:hover:bg-neutral-800/95 focus-within:bg-neutral-200/90 dark:focus-within:bg-neutral-800/95 relative w-full rounded-xl border-0 text-sm transition-colors",
        className
      )}
    >
      {paramsOpen && (
        <div
          ref={popoverRef}
          className="bg-neutral-200/90 dark:bg-neutral-800/95 text-foreground absolute bottom-[calc(100%+8px)] left-0 z-30 w-72 space-y-2 rounded-xl p-2.5 shadow-none sm:w-80"
          role="dialog"
          aria-label="Parameters"
        >
          <div className="flex items-center gap-1.5">
            <ElasticSlider
              className="flex-1"
              label="Top-K"
              min={1}
              max={20}
              step={1}
              value={topK}
              onValueChange={(val) => onParamChange?.("top_k", val)}
              formatValue={(v) => `${Math.round(v)}`}
            />
            <button
              type="button"
              onClick={() => onParamChange?.("top_k", DEFAULT_TOP_K)}
              title={`Reset Top-K (default: ${DEFAULT_TOP_K})`}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md p-1.5 transition-colors shrink-0 hover:bg-neutral-300/70 dark:hover:bg-neutral-700/70"
            >
              <IconRotate2 size={13} stroke={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <ElasticSlider
              className="flex-1"
              label="Temperature"
              min={0}
              max={1}
              step={0.05}
              value={temperature}
              onValueChange={(val) => onParamChange?.("temperature", val)}
              formatValue={(v) => v.toFixed(2)}
            />
            <button
              type="button"
              onClick={() =>
                onParamChange?.("temperature", DEFAULT_TEMPERATURE)
              }
              title={`Reset Temperature (default: ${DEFAULT_TEMPERATURE})`}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md p-1.5 transition-colors shrink-0 hover:bg-neutral-300/70 dark:hover:bg-neutral-700/70"
            >
              <IconRotate2 size={13} stroke={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <ElasticSlider
              className="flex-1"
              label="Similarity Threshold"
              min={0}
              max={1}
              step={0.05}
              value={scoreThreshold}
              onValueChange={(val) =>
                onParamChange?.("score_threshold", val)
              }
              formatValue={(v) => v.toFixed(2)}
            />
            <button
              type="button"
              onClick={() =>
                onParamChange?.("score_threshold", DEFAULT_SCORE_THRESHOLD)
              }
              title={`Reset Similarity Threshold (default: ${DEFAULT_SCORE_THRESHOLD})`}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md p-1.5 transition-colors shrink-0 hover:bg-neutral-300/70 dark:hover:bg-neutral-700/70"
            >
              <IconRotate2 size={13} stroke={2.5} />
            </button>
          </div>
        </div>
      )}

      {showCommands && filteredCommands.length > 0 && (
        <div className="bg-sidebar text-foreground absolute bottom-[calc(100%+8px)] left-0 z-20 w-64 space-y-0.5 rounded-xl p-1 shadow-none">
          {filteredCommands.map((cmd, idx) => (
            <button
              key={cmd.name}
              type="button"
              onClick={() => pickCommand(cmd.name)}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                idx === activeCommandIndex
                  ? "bg-sidebar-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <span className="text-primary font-mono font-bold dark:text-emerald-400">
                {cmd.name}
              </span>
              <span className="text-muted-foreground ml-2 truncate text-[10px]">
                {cmd.description}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 p-3">
        <textarea
          ref={inputRef}
          rows={1}
          value={draft}
          placeholder={isListening ? "Listening…" : placeholder}
          aria-label="Prompt"
          onChange={(e) => {
            setDraft(e.target.value);
            setActiveCommandIndex(0);
          }}
          onKeyDown={onKeyDown}
          className="text-foreground placeholder:text-muted-foreground block w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed [-ms-overflow-style:none] [scrollbar-width:none] focus:outline-none [&::-webkit-scrollbar]:hidden"
        />

        <div className="flex items-center gap-1 pt-1">
          {onSummarize && (
            <button
              type="button"
              onClick={onSummarize}
              title="Summarize documents"
              className="text-primary hover:text-primary/80 inline-flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <IconFileTextSpark size={18} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setParamsOpen((v) => !v)}
            aria-expanded={paramsOpen}
            title="Adjust Top-K, Temperature & Similarity Threshold"
            className={cn(
              "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-1.5 font-mono text-xs font-medium transition-colors",
              paramsOpen
                ? "text-primary dark:text-emerald-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <IconAdjustmentsHorizontal
              size={18}
              className={
                paramsOpen
                  ? "text-primary dark:text-emerald-400"
                  : "text-muted-foreground"
              }
            />
            <span>Parameters</span>
          </button>

          <div className="flex-1" />

          {onDictate && (
            <VoicePill
              listening={isListening}
              disabled={busy}
              onStart={handleVoiceStart}
              onStop={handleVoiceStop}
            />
          )}

          <button
            type="button"
            disabled={!armed}
            aria-label={busy ? "Stop" : "Send"}
            title={busy ? "Stop generation" : "Send message"}
            onClick={() => {
              if (busy) onStop?.();
              else send();
            }}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md transition-colors",
              busy
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                : armed
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  : "cursor-not-allowed bg-neutral-300/80 text-neutral-500 dark:bg-neutral-700/80 dark:text-neutral-400"
            )}
          >
            {busy ? (
              <IconSquare size={16} className="fill-current" />
            ) : (
              <IconArrowUp size={18} stroke={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromptBar;
