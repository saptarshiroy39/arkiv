"use client";

import React, {
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { IconMicrophone } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface VoicePillProps {
  listening?: boolean;
  disabled?: boolean;
  size?: number;
  className?: string;
  title?: string;
  onStart?: () => void;
  onStop?: () => void;
}

interface State {
  hist: number[];
  tick: number;
  acc: number;
  startedAt: number;
  raf: number;
  last: number;
  env: number;
  t0: number;
}

const LOOP = 4.8;
const SYLLABLES: [number, number, number][] = [
  [0.1, 0.16, 0.9],
  [0.3, 0.12, 0.7],
  [0.5, 0.2, 1],
  [0.95, 0.14, 0.8],
  [1.15, 0.1, 0.6],
  [1.3, 0.22, 0.95],
  [1.9, 0.16, 0.85],
  [2.12, 0.12, 0.7],
  [2.3, 0.18, 0.9],
  [2.55, 0.1, 0.5],
  [3.05, 0.24, 1],
  [3.4, 0.12, 0.75],
  [3.6, 0.16, 0.9],
];
const DT_MAX = 0.05;
const WAVE_EVERY = 4;
const WAVE_MAX = 80;

const simulatedLevel = (t: number) => {
  const u = t % LOOP;
  let a = 0.06;
  for (const [s, d, p] of SYLLABLES) {
    const x = (u - s) / d;
    if (x >= 0 && x <= 1)
      a = Math.max(a, p * 0.5 * (1 - Math.cos(2 * Math.PI * x)));
  }
  return a * (0.7 + 0.3 * Math.abs(Math.sin(2 * Math.PI * 7.1 * u)));
};

const drawWave = (
  s: State,
  canvas: HTMLCanvasElement,
  level: number,
  color: string,
  floor = 0.15
) => {
  const dpr = Math.min(
    2,
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  );
  const rect = canvas.getBoundingClientRect();
  const W = Math.max(1, Math.round(rect.width * dpr));
  const H = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  s.acc = Math.max(s.acc, level);
  s.tick = (s.tick + 1) % WAVE_EVERY;
  if (s.tick === 0) {
    s.hist.push(s.acc);
    s.acc = 0;
    if (s.hist.length > WAVE_MAX) s.hist.shift();
  }
  const bw = 2 * dpr;
  const step = 3.2 * dpr;
  const shift = (s.tick / WAVE_EVERY) * step;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = color;
  for (let i = 0; i < s.hist.length; i += 1) {
    const v = s.hist[s.hist.length - 1 - i];
    const x = W - (i + 1) * step - shift;
    if (x + bw < 0) break;
    const h = Math.max(bw, (floor + (1 - floor) * v) * H);
    const t = Math.min(1, Math.max(0, (x + bw / 2) / (W * 0.55)));
    const fade = t * t * (3 - 2 * t);
    ctx.globalAlpha = (0.35 + 0.65 * v) * fade;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x, (H - h) / 2, bw, h, bw / 2);
    } else {
      ctx.rect(x, (H - h) / 2, bw, h);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

const clock = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export const VoicePill: React.FC<VoicePillProps> = ({
  listening = false,
  disabled = false,
  size = 28,
  title,
  onStart,
  onStop,
  className = "",
}) => {
  const timeRef = useRef<HTMLSpanElement>(null);
  const waveRef = useRef<HTMLCanvasElement>(null);
  const st = useRef<State>({
    hist: [],
    tick: 0,
    acc: 0,
    startedAt: 0,
    raf: 0,
    last: 0,
    env: 0,
    t0: 0,
  });

  useEffect(() => {
    const s = st.current;
    if (!listening) {
      if (s.raf) {
        cancelAnimationFrame(s.raf);
        s.raf = 0;
      }
      if (timeRef.current) timeRef.current.textContent = "0:00";
      if (waveRef.current) {
        const ctx = waveRef.current.getContext("2d");
        if (ctx)
          ctx.clearRect(0, 0, waveRef.current.width, waveRef.current.height);
      }
      return;
    }

    s.hist = [];
    s.tick = 0;
    s.acc = 0;
    s.env = 0;
    s.startedAt = performance.now();
    s.t0 = s.startedAt;
    s.last = s.startedAt;
    if (timeRef.current) timeRef.current.textContent = "0:00";

    const frame = (now: number) => {
      const dt = Math.min((now - s.last) / 1000, DT_MAX);
      s.last = now;
      const target = simulatedLevel((now - s.t0) / 1000);
      const tau = (target > s.env ? 40 : 240) / 1000;
      s.env += (target - s.env) * (1 - Math.exp(-dt / tau));
      if (timeRef.current) {
        const text = clock(now - s.startedAt);
        if (timeRef.current.textContent !== text)
          timeRef.current.textContent = text;
      }
      if (waveRef.current) {
        const waveColor = getComputedStyle(waveRef.current).color || "#10b981";
        drawWave(s, waveRef.current, s.env, waveColor);
      }
      s.raf = requestAnimationFrame(frame);
    };

    s.raf = requestAnimationFrame(frame);

    return () => {
      if (s.raf) {
        cancelAnimationFrame(s.raf);
        s.raf = 0;
      }
    };
  }, [listening]);

  const clockW = 32;
  const waveW = 54;
  const extra = clockW + waveW + 6;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label="Dictate"
      aria-pressed={listening}
      title={title ?? (listening ? "Stop dictation" : "Dictate")}
      onClick={(e) => {
        e.preventDefault();
        if (disabled) return;
        if (listening) onStop?.();
        else onStart?.();
      }}
      onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "Escape") {
          if (listening) onStop?.();
          return;
        }
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          if (disabled) return;
          if (listening) onStop?.();
          else onStart?.();
        }
      }}
      data-state={listening ? "listening" : "idle"}
      style={
        {
          width: `${size}px`,
          height: `${size}px`,
          "--vp-extra": `${extra}px`,
        } as CSSProperties
      }
      className={cn(
        "group relative isolate inline-grid cursor-pointer place-items-center rounded-md border-0 p-0 outline-none select-none",
        "hover:text-foreground bg-neutral-300/80 text-neutral-600 hover:bg-neutral-300",
        "dark:hover:text-foreground dark:bg-neutral-700/80 dark:text-neutral-300 dark:hover:bg-neutral-700",
        "data-[state=listening]:z-10 data-[state=listening]:bg-neutral-300 data-[state=listening]:dark:bg-neutral-700",
        "data-[state=listening]:text-primary data-[state=listening]:dark:text-emerald-400",
        "transition-colors disabled:pointer-events-none disabled:cursor-default disabled:opacity-55",
        className
      )}
    >
      {/* Expanding capsule background with rounded-md (8px) corners */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 -left-[var(--vp-extra)] rounded-md",
          "bg-neutral-300 dark:bg-neutral-700",
          "transition-[clip-path] duration-200 ease-out",
          "group-data-[state=idle]:[clip-path:inset(0_0_0_var(--vp-extra)_round_8px)]",
          "group-data-[state=listening]:[clip-path:inset(0_0_0_0_round_8px)]"
        )}
        aria-hidden="true"
      />

      {/* Waveform Canvas */}
      <canvas
        ref={waveRef}
        className={cn(
          "pointer-events-none absolute top-[18%] right-[calc(100%+34px)] h-[64%] w-[54px]",
          "opacity-0 transition-opacity duration-200",
          "group-data-[state=listening]:opacity-100"
        )}
        aria-hidden="true"
      />

      {/* Running Clock */}
      <span
        ref={timeRef}
        className={cn(
          "pointer-events-none absolute inset-y-0 right-full grid w-[32px] place-items-center leading-none",
          "font-mono text-xs font-medium tabular-nums opacity-0 transition-opacity duration-200",
          "group-data-[state=listening]:opacity-100"
        )}
        aria-hidden="true"
      >
        0:00
      </span>

      {/* Mic Icon & Stop Mark */}
      <span className="relative grid size-7 place-items-center">
        <span
          className={cn(
            "inline-flex transition-all duration-200 [grid-area:1/1]",
            "group-data-[state=listening]:scale-75 group-data-[state=listening]:opacity-0"
          )}
        >
          <IconMicrophone size={18} stroke={2} />
        </span>
        <span
          className={cn(
            "bg-primary size-2.5 rounded-[2px] [grid-area:1/1] dark:bg-emerald-400",
            "scale-50 opacity-0 transition-all duration-200",
            "group-data-[state=listening]:scale-100 group-data-[state=listening]:opacity-100"
          )}
          aria-hidden="true"
        />
      </span>
    </button>
  );
};

export default VoicePill;
