"use client";

import React, { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type LatticeStatus = "working" | "done" | "error";
export type LatticePatternName = "spiral";
export type LatticeGrid = 3;

export interface LatticeLoaderProps {
  label?: string;
  doneLabel?: string;
  errorLabel?: string;
  status?: LatticeStatus;
  pattern?: LatticePatternName;
  grid?: LatticeGrid;
  shape?: "square" | "round";
  color?: string;
  doneColor?: string;
  errorColor?: string;
  cellSize?: number;
  gap?: number;
  fontSize?: number;
  step?: number;
  idleOpacity?: number;
  glow?: boolean;
  glowColor?: string;
  showTimer?: boolean;
  elapsed?: number;
  className?: string;
  style?: CSSProperties;
}

const SPIRAL_PATTERN = {
  cells: [0, 1, 2, 7, 8, 3, 6, 5, 4],
  loop: 9,
  scale: 1.2,
};

const MARKS: Record<"done" | "error", number[]> = {
  done: [2, 3, 5, 7],
  error: [0, 2, 4, 6, 8],
};

const CELL =
  "h-[var(--ll-cell)] w-[var(--ll-cell)] [border-radius:max(1px,calc(var(--ll-cell)*0.25))] [background:var(--ll-color)] group-data-[shape=round]:rounded-full";

const STYLE = `
@keyframes lattice-on-35 {
  0%, 100% { opacity: var(--ll-idle); }
  10%, 24% { opacity: var(--ll-peak); }
  35% { opacity: var(--ll-idle); }
}
@media (prefers-reduced-motion: reduce) {
  .ll-run { --ll-peak: 0.7; }
  .ll-run > span { animation-delay: 0ms !important; animation-duration: 1400ms !important; }
  .ll-mark { transform: none !important; }
  .ll-text { filter: none !important; }
}
`;

const fmt = (ds: number) =>
  ds < 600 ? `${(ds / 10).toFixed(1)}s` : `${Math.floor(ds / 600)}m ${((ds % 600) / 10).toFixed(1)}s`;

const spoken = (ds: number) =>
  ds < 600
    ? `${(ds / 10).toFixed(1)} seconds`
    : `${Math.floor(ds / 600)} minutes ${((ds % 600) / 10).toFixed(1)} seconds`;

export const LatticeLoader: React.FC<LatticeLoaderProps> = ({
  label = "Thinking",
  doneLabel = "Done in",
  errorLabel = "Failed after",
  status = "working",
  shape = "square",
  color = "currentColor",
  doneColor = "#22c55e",
  errorColor = "#ef4444",
  cellSize = 6,
  gap = 2,
  fontSize = 14,
  step = 90,
  idleOpacity = 0.15,
  glow = false,
  glowColor = "",
  showTimer = true,
  elapsed,
  className = "",
  style,
}) => {
  const d = step * SPIRAL_PATTERN.scale;
  const cycle = Math.round(SPIRAL_PATTERN.loop * d);

  const timerRef = useRef<HTMLSpanElement>(null);
  const mark = status === "error" ? "error" : "done";

  useIsomorphicLayoutEffect(() => {
    if (elapsed != null) {
      if (timerRef.current) timerRef.current.textContent = fmt(Math.round(elapsed * 10));
      return undefined;
    }
    if (status !== "working") return undefined;
    const startedAt = performance.now();
    if (timerRef.current) timerRef.current.textContent = fmt(0);
    const id = setInterval(() => {
      const ds = Math.floor((performance.now() - startedAt) / 100);
      if (timerRef.current) timerRef.current.textContent = fmt(ds);
    }, 100);
    return () => clearInterval(id);
  }, [status, elapsed]);

  const announce =
    status === "working"
      ? `${label}, in progress`
      : `${status === "done" ? doneLabel : errorLabel}${showTimer && elapsed != null ? ` ${spoken(Math.round(elapsed * 10))}` : ""}`;

  return (
    <span
      role="status"
      className={`ll-root group relative inline-flex items-center leading-none [font-family:inherit] [gap:calc(var(--ll-font)*0.625)] [font-size:var(--ll-font)] [color:var(--ll-color)]${className ? ` ${className}` : ""}`}
      data-status={status}
      data-shape={shape}
      data-glow={glow ? "" : undefined}
      style={
        {
          "--ll-n": 3,
          "--ll-cell": `${cellSize}px`,
          "--ll-gap": `${gap}px`,
          "--ll-font": `${fontSize}px`,
          "--ll-color": color,
          "--ll-mark": status === "error" ? errorColor : doneColor,
          "--ll-idle": idleOpacity,
          "--ll-glow": glowColor || color,
          "--ll-mark-glow": glowColor || (status === "error" ? errorColor : doneColor),
          "--ll-cycle": `${cycle}ms`,
          "--ll-peak": 1,
          "--ll-ease-out": "cubic-bezier(0.23, 1, 0.32, 1)",
          "--ll-ease-in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
          ...style,
        } as CSSProperties
      }
    >
      <style>{STYLE}</style>
      <span className="grid shrink-0" aria-hidden="true">
        <span className="ll-run [grid-area:1/1] grid [grid-template-columns:repeat(var(--ll-n),var(--ll-cell))] [gap:var(--ll-gap)] [transition:opacity_200ms_ease] group-data-[status=done]:opacity-0 group-data-[status=error]:opacity-0 group-data-[status=done]:[&>span]:[animation-play-state:paused] group-data-[status=error]:[&>span]:[animation-play-state:paused]">
          {SPIRAL_PATTERN.cells.map((unit, i) => (
            <span
              key={i}
              className={`${CELL} [opacity:var(--ll-idle)] animate-[lattice-on-35_var(--ll-cycle)_infinite] [animation-timing-function:var(--ll-ease-in-out)] group-data-[glow]:[box-shadow:0_0_calc(var(--ll-cell)*1.2)_calc(var(--ll-cell)*0.12)_var(--ll-glow)]`}
              style={{ animationDelay: `${Math.round(unit * d)}ms` }}
            />
          ))}
        </span>
        <span className="ll-mark [grid-area:1/1] grid [grid-template-columns:repeat(var(--ll-n),var(--ll-cell))] [gap:var(--ll-gap)] origin-center opacity-0 [transform:scale(0.9)] [transition:opacity_160ms_var(--ll-ease-out),transform_160ms_var(--ll-ease-out)] group-data-[status=done]:opacity-100 group-data-[status=done]:[transform:none] group-data-[status=done]:[transition:opacity_200ms_ease,transform_200ms_var(--ll-ease-out)] group-data-[status=error]:opacity-100 group-data-[status=error]:[transform:none] group-data-[status=error]:[transition:opacity_200ms_ease,transform_200ms_var(--ll-ease-out)]">
          {SPIRAL_PATTERN.cells.map((_, i) => (
            <span
              key={i}
              className={`${CELL} [opacity:var(--ll-idle)] [transition:opacity_200ms_ease,background-color_200ms_ease] data-[on]:[background:var(--ll-mark)] data-[on]:[opacity:var(--ll-peak)] group-data-[glow]:data-[on]:[box-shadow:0_0_calc(var(--ll-cell)*1.2)_calc(var(--ll-cell)*0.12)_var(--ll-mark-glow)]`}
              data-on={MARKS[mark].includes(i) ? "" : undefined}
            />
          ))}
        </span>
      </span>
      <span className="relative inline-block font-medium" aria-hidden="true">
        <span
          className="ll-text absolute top-0 left-0 whitespace-nowrap opacity-0 [filter:blur(2px)] [transition:opacity_200ms_ease,filter_200ms_ease] data-[active]:static data-[active]:opacity-100 data-[active]:[filter:blur(0)]"
          data-active={status === "working" ? "" : undefined}
        >
          {label}
        </span>
        <span
          className="ll-text absolute top-0 left-0 whitespace-nowrap opacity-0 [filter:blur(2px)] [transition:opacity_200ms_ease,filter_200ms_ease] data-[active]:static data-[active]:opacity-100 data-[active]:[filter:blur(0)]"
          data-active={status === "done" ? "" : undefined}
        >
          {doneLabel}
        </span>
        <span
          className="ll-text absolute top-0 left-0 whitespace-nowrap opacity-0 [filter:blur(2px)] [transition:opacity_200ms_ease,filter_200ms_ease] data-[active]:static data-[active]:opacity-100 data-[active]:[filter:blur(0)]"
          data-active={status === "error" ? "" : undefined}
        >
          {errorLabel}
        </span>
      </span>
      {showTimer ? (
        <span
          ref={timerRef}
          className="font-mono tabular-nums opacity-60 [font-size:calc(var(--ll-font)*0.875)]"
          aria-hidden="true"
        >
          {elapsed != null ? fmt(Math.round(elapsed * 10)) : "0.0s"}
        </span>
      ) : null}
      <span className="sr-only">{announce}</span>
    </span>
  );
};

export default LatticeLoader;
