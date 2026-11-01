"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { Loader } from "@/components/ui/loader";
import { EASE_OUT, SPRING_SWAP } from "@/lib/ease";
import {
  TEXT_SHIMMER_CLASS_NAME,
  TEXT_SHIMMER_KEYFRAMES,
  textShimmerStyle,
} from "@/lib/text-shimmer";
import { cn } from "@/lib/utils";

const DEFAULT_PHRASES = [
  "Thinking",
  "Reading the context",
  "Connecting the details",
  "Forming a response",
];

const CASCADE_STAGGER = 0.025;

export type ReasoningTextVariant = "cascade";

export interface ReasoningTextProps {
  /** Phrases cycled through while the agent works. */
  phrases?: string[];
  /** Animation used when the active phrase changes. Defaults to cascade. */
  variant?: ReasoningTextVariant;
  /** Milliseconds each phrase remains visible. */
  interval?: number;
  /** Seconds taken for one shimmer pass. */
  shimmerDuration?: number;
  /** Optional leading visual. Defaults to a terminal-style ASCII loader. */
  indicator?: ReactNode;
  className?: string;
}

type PhraseProps = {
  phrase: string;
  reduce: boolean;
  shimmerDuration: number;
};

function CascadePhrase({
  phrase,
  reduce,
  shimmerDuration,
}: PhraseProps) {
  const text = `${phrase}…`;

  if (reduce) {
    return (
      <span
        className={cn(
          "col-start-1 row-start-1 inline-block justify-self-start whitespace-pre",
          TEXT_SHIMMER_CLASS_NAME,
        )}
        style={textShimmerStyle(shimmerDuration)}
      >
        {text}
      </span>
    );
  }

  return (
    <AnimatePresence initial={false}>
      <motion.span
        key={phrase}
        className="col-start-1 row-start-1 inline-block justify-self-start whitespace-pre"
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {text.split("").map((character, characterIndex) => (
          <motion.span
            key={characterIndex}
            custom={characterIndex * CASCADE_STAGGER}
            variants={{
              initial: { opacity: 0, y: "100%" },
              animate: (delay: number) => ({
                opacity: 1,
                y: "0%",
                transition: { ...SPRING_SWAP, delay },
              }),
              exit: (delay: number) => ({
                opacity: 0,
                y: "-100%",
                transition: {
                  duration: 0.14,
                  ease: EASE_OUT,
                  delay: delay * 0.45,
                },
              }),
            }}
            className={cn(
              "inline-block whitespace-pre will-change-[opacity,transform]",
              TEXT_SHIMMER_CLASS_NAME,
            )}
            style={textShimmerStyle(shimmerDuration)}
          >
            {character}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}

export function ReasoningText({
  phrases = DEFAULT_PHRASES,
  interval = 1800,
  shimmerDuration = 2.2,
  indicator,
  className,
}: ReasoningTextProps) {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const statusId = useId();
  const safePhrases = phrases.length > 0 ? phrases : DEFAULT_PHRASES;
  const phrase = safePhrases[index % safePhrases.length];
  const longestPhrase = safePhrases.reduce((longest, current) =>
    current.length > longest.length ? current : longest,
  );
  const phraseProps = { phrase, reduce, shimmerDuration };

  useEffect(() => {
    if (safePhrases.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % safePhrases.length);
    }, Math.max(600, interval));

    return () => window.clearInterval(timer);
  }, [interval, safePhrases.length]);

  return (
    <>
      <style>{TEXT_SHIMMER_KEYFRAMES}</style>
      <span
        role="status"
        aria-live="polite"
        aria-labelledby={statusId}
        className={cn(
          "inline-flex items-center gap-2 text-sm font-medium text-muted-foreground",
          className,
        )}
      >
        <span aria-hidden="true" className="inline-flex size-3 shrink-0 items-center justify-center">
          {indicator ?? (
            <Loader
              variant="ascii-line"
              size={14}
              speed={0.8}
              label="Reasoning"
            />
          )}
        </span>

        <span aria-hidden="true" className="grid overflow-hidden text-left">
          <span className="invisible col-start-1 row-start-1 whitespace-nowrap">
            {longestPhrase}…
          </span>
          <CascadePhrase {...phraseProps} />
        </span>

        <span id={statusId} className="sr-only">
          {phrase}
        </span>
      </span>
    </>
  );
}
