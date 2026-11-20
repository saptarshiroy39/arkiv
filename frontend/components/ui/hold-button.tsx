"use client";

import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type HoldButtonSize = "sm" | "md" | "lg";

export interface HoldButtonProps {
  children?: ReactNode;
  holdLabel?: ReactNode;
  doneLabel?: ReactNode;
  icon?: ReactNode;
  doneIcon?: ReactNode;
  backgroundColor?: string;
  fillColor?: string;
  textColor?: string;
  fillTextColor?: string;
  size?: HoldButtonSize;
  radius?: number;
  holdTime?: number;
  releaseTime?: number;
  pressScale?: number;
  wave?: boolean;
  waveAmplitude?: number;
  resetAfter?: number;
  disabled?: boolean;
  title?: string;
  onHold?: () => void;
  onTap?: () => void;
  className?: string;
}

type Phase = "idle" | "holding" | "done";
type Input = "pointer" | "key" | null;

interface Motion {
  raf: number;
  p: number;
  from: number;
  to: number;
  start: number;
}

interface Gesture {
  pointerId: number | null;
  start: number;
  rect: DOMRect | null;
}

interface ReleaseOptions {
  drifted?: boolean;
}

const TAP_MS = 250;
const HIT_PAD = 10;
const LINEAR = (t: number) => t;
const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SIZES: Record<HoldButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const WAVE_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='200' viewBox='0 0 20 200' preserveAspectRatio='none'%3E%3Cpath d='M0 0H10C18 8 18 25.3 10 33.3S2 58.7 10 66.7S18 92 10 100S2 125.3 10 133.3S18 158.7 10 166.7S2 192 10 200H0Z'/%3E%3C/svg%3E")`;

const STYLE = `
.hb-root{--hb-w:0px;--hb-h:0px;--hb-cycles:2;--hb-p:0}
.hb-fill{clip-path:inset(0 calc((1 - var(--hb-p)) * (100% + 0.75 * var(--hb-wave)) - var(--hb-p) * 0.25 * var(--hb-wave)) 0 0)}
.hb-crest{
  mask-image:var(--hb-mask);-webkit-mask-image:var(--hb-mask);
  mask-repeat:repeat-y;-webkit-mask-repeat:repeat-y;
  mask-size:var(--hb-wave) calc(var(--hb-h)*2);-webkit-mask-size:var(--hb-wave) calc(var(--hb-h)*2);
  mask-position:calc(-1*var(--hb-wave) + var(--hb-p)*(var(--hb-w) + var(--hb-wave))) calc(-1*var(--hb-p)*var(--hb-cycles)*var(--hb-h));
  -webkit-mask-position:calc(-1*var(--hb-wave) + var(--hb-p)*(var(--hb-w) + var(--hb-wave))) calc(-1*var(--hb-p)*var(--hb-cycles)*var(--hb-h));
}
@media (prefers-reduced-motion:reduce){
  .hb-root{transform:none!important}
  .hb-fill{clip-path:inset(0)!important;opacity:0}
  .hb-crest{display:none}
  .hb-root[data-phase=holding] .hb-fill,.hb-root[data-phase=done] .hb-fill{opacity:1}
}`;

export const HoldButton: React.FC<HoldButtonProps> = ({
  children = "Hold to delete",
  holdLabel,
  doneLabel = "Deleted",
  icon,
  doneIcon,
  backgroundColor,
  fillColor,
  textColor,
  fillTextColor,
  size = "md",
  radius = 4,
  holdTime = 2000,
  releaseTime = 200,
  pressScale = 0.97,
  wave = true,
  waveAmplitude = 6,
  resetAfter = 1200,
  disabled = false,
  title,
  onHold,
  onTap,
  className = "",
}) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [input, setInput] = useState<Input>(null);
  const phaseRef = useRef<Phase>("idle");
  const inputRef = useRef<Input>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const gesture = useRef<Gesture>({ pointerId: null, start: 0, rect: null });
  const timers = useRef({ complete: 0, reset: 0 });
  const hintId = useId();

  const go = (next: Phase, kind: Input = null) => {
    phaseRef.current = next;
    inputRef.current = kind;
    setPhase(next);
    setInput(kind);
  };

  const clearTimers = () => {
    clearTimeout(timers.current.complete);
    clearTimeout(timers.current.reset);
  };

  const motion = useRef<Motion>({ raf: 0, p: 0, from: 0, to: 0, start: 0 });
  const completeRef = useRef<() => void>(() => {});

  const drive = React.useCallback(
    (to: number, duration: number, ease: (t: number) => number) => {
      const m = motion.current;
      cancelAnimationFrame(m.raf);
      m.from = m.p;
      m.to = to;
      m.start = performance.now();
      const step = (now: number) => {
        const t = duration > 0 ? Math.min(1, (now - m.start) / duration) : 1;
        m.p = m.from + (m.to - m.from) * ease(t);
        buttonRef.current?.style.setProperty("--hb-p", m.p.toFixed(4));
        if (t < 1) {
          m.raf = requestAnimationFrame(step);
          return;
        }
        m.raf = 0;
        if (m.to === 1) completeRef.current();
      };
      m.raf = requestAnimationFrame(step);
    },
    []
  );

  const complete = React.useCallback(() => {
    if (phaseRef.current !== "holding") return;
    if (performance.now() - gesture.current.start < holdTime - 50) return;
    clearTimers();
    go("done", inputRef.current);
    onHold?.();
    if (resetAfter > 0) {
      timers.current.reset = window.setTimeout(() => {
        go("idle");
        drive(0, releaseTime, EASE_OUT);
      }, resetAfter);
    }
  }, [drive, holdTime, onHold, releaseTime, resetAfter]);

  useEffect(() => {
    completeRef.current = complete;
  });

  const begin = React.useCallback(
    (kind: Input) => {
      if (disabled || phaseRef.current !== "idle") return false;
      const button = buttonRef.current;
      if (!button) return false;
      gesture.current.start = performance.now();
      gesture.current.rect = button.getBoundingClientRect();
      go("holding", kind);
      drive(1, holdTime, LINEAR);
      timers.current.complete = window.setTimeout(complete, holdTime + 100);
      return true;
    },
    [complete, disabled, drive, holdTime]
  );

  const release = React.useCallback(
    ({ drifted = false }: ReleaseOptions = {}) => {
      if (phaseRef.current !== "holding") return;
      clearTimers();
      const held = performance.now() - gesture.current.start;
      go("idle");
      drive(0, releaseTime, EASE_OUT);
      if (!drifted && held < TAP_MS) onTap?.();
    },
    [drive, onTap, releaseTime]
  );

  const releaseRef = useRef(release);
  useEffect(() => {
    releaseRef.current = release;
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || !e.isPrimary || gesture.current.pointerId !== null)
      return;
    if (!begin("pointer")) return;
    gesture.current.pointerId = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const endPointer = (
    e: React.PointerEvent<HTMLButtonElement>,
    options?: ReleaseOptions
  ) => {
    if (e.pointerId !== gesture.current.pointerId) return;
    gesture.current.pointerId = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    release(options);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerId !== gesture.current.pointerId) return;
    const r = gesture.current.rect;
    if (!r) return;
    const out =
      e.clientX < r.left - HIT_PAD ||
      e.clientX > r.right + HIT_PAD ||
      e.clientY < r.top - HIT_PAD ||
      e.clientY > r.bottom + HIT_PAD;
    if (out) endPointer(e, { drifted: true });
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "touch") endPointer(e, { drifted: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape") {
      if (inputRef.current === "key") release({ drifted: true });
      return;
    }
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!e.repeat) begin("key");
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (inputRef.current === "key") release();
    }
  };

  useIsomorphicLayoutEffect(() => {
    const button = buttonRef.current;
    if (!button) return undefined;
    const measure = () => {
      button.style.setProperty("--hb-w", `${button.offsetWidth}px`);
      button.style.setProperty("--hb-h", `${button.offsetHeight}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(button);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== "holding") return undefined;
    const cancel = () => releaseRef.current({ drifted: true });
    const onVisibility = () => {
      if (document.hidden) cancel();
    };
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [phase]);

  useEffect(() => {
    const t = timers.current;
    const m = motion.current;
    return () => {
      clearTimeout(t.complete);
      clearTimeout(t.reset);
      cancelAnimationFrame(m.raf);
    };
  }, []);

  const labels = (
    <>
      <span
        className="inline-flex items-center gap-2 whitespace-nowrap transition-opacity duration-200 select-none [grid-area:1/1] group-data-[phase=done]/hb:opacity-0"
        aria-hidden={phase === "done"}
      >
        {icon && (
          <span className="inline-flex flex-none [&>svg]:block">{icon}</span>
        )}
        {holdLabel ? (
          <>
            <span className="inline group-hover/hb:hidden group-data-[phase=holding]/hb:hidden">
              {children}
            </span>
            <span className="hidden group-hover/hb:inline group-data-[phase=holding]/hb:inline">
              {holdLabel}
            </span>
          </>
        ) : (
          children
        )}
      </span>
      <span
        className="inline-flex items-center gap-2 whitespace-nowrap opacity-0 transition-opacity duration-200 select-none [grid-area:1/1] group-data-[phase=done]/hb:opacity-100"
        aria-hidden={phase !== "done"}
      >
        {doneIcon && (
          <span className="inline-flex flex-none [&>svg]:block">
            {doneIcon}
          </span>
        )}
        {doneLabel}
      </span>
    </>
  );

  const cssVars = {
    "--hb-radius": `${radius}px`,
    "--hb-mask": WAVE_MASK,
    "--hb-hold": `${holdTime}ms`,
    "--hb-cycles": holdTime / 1100,
    "--hb-release": `${releaseTime}ms`,
    "--hb-press": pressScale,
    "--hb-wave": `${wave ? waveAmplitude : 0}px`,
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(textColor ? { color: textColor } : {}),
  } as CSSProperties;

  const fillStyle: CSSProperties = {
    backgroundColor: fillColor || "var(--destructive)",
    color: fillTextColor || "var(--destructive-foreground)",
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      title={title}
      className={cn(
        "hb-root group/hb relative isolate m-0 inline-grid cursor-pointer touch-manipulation place-items-center [border-radius:var(--hb-radius)]",
        "border-0 leading-none font-medium tracking-[0.01em] outline-none select-none",
        "[-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]",
        "text-foreground bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700",
        "transition-transform duration-160 ease-out",
        "data-[phase=holding]:[transform:scale(var(--hb-press))]",
        "focus-visible:outline-destructive focus-visible:outline-2 focus-visible:outline-offset-[3px]",
        "disabled:pointer-events-none disabled:cursor-default disabled:opacity-50",
        SIZES[size] || SIZES.md,
        className
      )}
      data-phase={phase}
      data-input={input ?? undefined}
      aria-describedby={hintId}
      style={cssVars}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => endPointer(e)}
      onPointerCancel={(e) => endPointer(e, { drifted: true })}
      onLostPointerCapture={(e) => endPointer(e, { drifted: true })}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <style>{STYLE}</style>
      <span className="relative z-[2] grid place-items-center">{labels}</span>
      <span
        className="pointer-events-none absolute inset-0 z-[3] [clip-path:inset(0_round_var(--hb-radius))]"
        aria-hidden="true"
      >
        <span
          className="hb-fill bg-destructive text-destructive-foreground absolute inset-0 grid place-items-center"
          style={fillStyle}
        >
          <span className="grid place-items-center">{labels}</span>
        </span>
        <span
          className="hb-crest bg-destructive text-destructive-foreground absolute inset-0 grid place-items-center"
          style={fillStyle}
        >
          <span className="grid place-items-center">{labels}</span>
        </span>
      </span>
      <span
        id={hintId}
        className="absolute h-px w-px overflow-hidden whitespace-nowrap [clip-path:inset(50%)]"
      >
        Press and hold for {Math.round(holdTime / 100) / 10} seconds to confirm
      </span>
    </button>
  );
};

export default HoldButton;
