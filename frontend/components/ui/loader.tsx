"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE_IN_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type LoaderVariant = "ascii-line" | "ascii" | "spinner";

const ASCII_SETS: Record<string, string[]> = {
  ascii: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  "ascii-line": ["|", "/", "-", "\\"],
};

export interface LoaderProps {
  /** Which animation to render. */
  variant?: LoaderVariant;
  /** Base square size in px. Everything scales from this. */
  size?: number;
  /** Seconds per animation cycle. */
  speed?: number;
  /** Accessible label announced to screen readers. */
  label?: string;
  className?: string;
}

const REDUCED = {
  animate: { opacity: [1, 0.4, 1] },
  transition: { duration: 1.4, ease: EASE_IN_OUT, repeat: Infinity },
};

export function Loader({
  variant = "ascii-line",
  size = 14,
  speed = 0.8,
  label = "Loading",
  className,
}: LoaderProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center text-foreground",
        className,
      )}
    >
      {variant === "spinner" && (
        <Spinner size={size} speed={speed} reduce={reduce} />
      )}
      {ASCII_SETS[variant] && (
        <Ascii
          frames={ASCII_SETS[variant]}
          size={size}
          speed={speed}
          reduce={reduce}
        />
      )}
      <span className="sr-only">{label}</span>
    </span>
  );
}

interface PartProps {
  size: number;
  speed: number;
  reduce: boolean;
}

function Spinner({ size, speed, reduce }: PartProps) {
  const stroke = Math.max(2, size * 0.09);
  const r = (size - stroke) / 2;
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      animate={reduce ? REDUCED.animate : { rotate: 360 }}
      transition={
        reduce
          ? REDUCED.transition
          : { duration: speed, ease: "linear", repeat: Infinity }
      }
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={stroke}
      />
      <path
        d={`M ${size / 2} ${size / 2 - r} A ${r} ${r} 0 0 1 ${size / 2 + r} ${size / 2}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

function Ascii({
  frames,
  size,
  speed,
  reduce,
}: PartProps & { frames: string[] }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const step = ((reduce ? speed * 2.5 : speed) / frames.length) * 1000;
    const id = setInterval(
      () => setFrame((f) => (f + 1) % frames.length),
      step,
    );
    return () => clearInterval(id);
  }, [frames.length, speed, reduce]);

  return (
    <span
      className="font-mono leading-none tabular-nums"
      style={{ fontSize: size, lineHeight: 1 }}
    >
      {frames[frame % frames.length]}
    </span>
  );
}
