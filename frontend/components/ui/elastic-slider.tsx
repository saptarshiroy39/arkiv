"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

const CLICK_THRESHOLD = 3;
const DEAD_ZONE = 32;
const MAX_CURSOR_RANGE = 200;
const MAX_STRETCH = 8;
const HANDLE_BUFFER = 8;
const LABEL_OFFSET = 14;
const VALUE_OFFSET = 14;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function decimalsForStep(step: number): number {
  const s = step.toString();
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

function roundValue(val: number, step: number): number {
  const raw = Math.round(val / step) * step;
  return parseFloat(raw.toFixed(decimalsForStep(step)));
}

function snapToDecile(rawValue: number, min: number, max: number): number {
  const normalized = (rawValue - min) / (max - min);
  const nearest = Math.round(normalized * 10) / 10;
  if (Math.abs(normalized - nearest) <= 0.03125) {
    return min + nearest * (max - min);
  }
  return rawValue;
}

function useControllableNumber(
  valueProp: number | undefined,
  defaultValue: number,
  onChange?: (val: number) => void
): [number, (next: number) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolled;

  const setValue = useCallback(
    (next: number) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  return [value, setValue];
}

export interface ElasticSliderProps {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export function ElasticSlider({
  label,
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max = 1,
  step = 0.01,
  formatValue,
  className,
}: ElasticSliderProps) {
  const [value, setValue] = useControllableNumber(
    valueProp,
    defaultValue ?? min,
    onValueChange
  );

  const shouldReduceMotion = useReducedMotion();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  const [isInteracting, setIsInteracting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [keyboardFocusRing, setKeyboardFocusRing] = useState(false);

  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const pendingPointerFocusRef = useRef(false);
  const isClickRef = useRef(true);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const wrapperRectRef = useRef<DOMRect | null>(null);
  const scaleRef = useRef(1);

  const percentage = ((value - min) / (max - min)) * 100;
  const isActive = isInteracting || isHovered || keyboardFocusRing;
  const displayValue = formatValue
    ? formatValue(value)
    : value.toFixed(decimalsForStep(step));

  const fillPercent = useMotionValue(percentage);
  const fillWidth = useTransform(fillPercent, (pct) => `${pct}%`);
  const handleLeft = useTransform(
    fillPercent,
    (pct) => `clamp(4px, calc(${pct}% - 2px), calc(100% - 6px))`
  );

  const rubberStretch = useMotionValue(0);
  const rubberWidth = useTransform(
    rubberStretch,
    (s) => `calc(100% + ${Math.abs(s)}px)`
  );
  const rubberX = useTransform(rubberStretch, (s) => (s < 0 ? s : 0));

  useEffect(() => {
    if (!isInteracting && !animRef.current) {
      fillPercent.jump(percentage);
    }
  }, [percentage, isInteracting, fillPercent]);

  const positionToValue = useCallback(
    (clientX: number) => {
      const rect = wrapperRectRef.current;
      if (!rect) return min;

      const sceneX = (clientX - rect.left) / scaleRef.current;
      const nativeWidth = wrapperRef.current?.offsetWidth ?? rect.width;
      const percent = clamp(sceneX / nativeWidth, 0, 1);

      return clamp(min + percent * (max - min), min, max);
    },
    [min, max]
  );

  const percentFromValue = useCallback(
    (v: number) => ((v - min) / (max - min)) * 100,
    [min, max]
  );

  const animateFillTo = useCallback(
    (targetPercent: number) => {
      animRef.current?.stop();

      if (shouldReduceMotion) {
        fillPercent.jump(targetPercent);
        animRef.current = null;
        return;
      }

      animRef.current = animate(fillPercent, targetPercent, {
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.8,
        onComplete: () => {
          animRef.current = null;
        },
      });
    },
    [fillPercent, shouldReduceMotion]
  );

  const computeRubberStretch = useCallback((clientX: number, sign: number) => {
    const rect = wrapperRectRef.current;
    if (!rect) return 0;

    const distancePast = sign < 0 ? rect.left - clientX : clientX - rect.right;
    const overflow = Math.max(0, distancePast - DEAD_ZONE);

    return (
      sign * MAX_STRETCH * Math.sqrt(Math.min(overflow / MAX_CURSOR_RANGE, 1))
    );
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    isClickRef.current = true;
    setIsInteracting(true);

    pendingPointerFocusRef.current = true;
    setKeyboardFocusRing(false);

    trackRef.current?.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      pendingPointerFocusRef.current = false;
    });

    const wrapper = wrapperRef.current;
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      wrapperRectRef.current = rect;
      scaleRef.current = rect.width / wrapper.offsetWidth;
    }
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isInteracting || !pointerDownPos.current) return;

      const dx = e.clientX - pointerDownPos.current.x;
      const dy = e.clientY - pointerDownPos.current.y;

      if (isClickRef.current && Math.hypot(dx, dy) > CLICK_THRESHOLD) {
        isClickRef.current = false;
      }

      if (isClickRef.current) return;

      const rect = wrapperRectRef.current;
      if (rect && !shouldReduceMotion) {
        if (e.clientX < rect.left) {
          rubberStretch.jump(computeRubberStretch(e.clientX, -1));
        } else if (e.clientX > rect.right) {
          rubberStretch.jump(computeRubberStretch(e.clientX, 1));
        } else {
          rubberStretch.jump(0);
        }
      }

      const newValue = positionToValue(e.clientX);
      animRef.current?.stop();
      animRef.current = null;
      fillPercent.jump(percentFromValue(newValue));
      setValue(roundValue(newValue, step));
    },
    [
      isInteracting,
      positionToValue,
      percentFromValue,
      setValue,
      step,
      fillPercent,
      rubberStretch,
      computeRubberStretch,
      shouldReduceMotion,
    ]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isInteracting) return;

      if (isClickRef.current) {
        const rawValue = positionToValue(e.clientX);
        const discreteSteps = (max - min) / step;
        const snapped =
          discreteSteps <= 10
            ? clamp(min + Math.round((rawValue - min) / step) * step, min, max)
            : snapToDecile(rawValue, min, max);

        animateFillTo(percentFromValue(snapped));
        setValue(roundValue(snapped, step));
      }

      if (!shouldReduceMotion && rubberStretch.get() !== 0) {
        animate(rubberStretch, 0, {
          type: "spring",
          visualDuration: 0.35,
          bounce: 0.15,
        });
      }

      setIsInteracting(false);
      pointerDownPos.current = null;
    },
    [
      isInteracting,
      positionToValue,
      percentFromValue,
      setValue,
      min,
      max,
      step,
      animateFillTo,
      rubberStretch,
      shouldReduceMotion,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const arrowStep = e.shiftKey ? step * 10 : step;
      let next: number | null = null;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = value + arrowStep;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = value - arrowStep;
          break;
        case "Home":
          next = min;
          break;
        case "End":
          next = max;
          break;
        default:
          return;
      }

      e.preventDefault();
      setKeyboardFocusRing(true);

      const snapped = roundValue(clamp(next, min, max), step);
      animateFillTo(percentFromValue(snapped));
      setValue(snapped);
    },
    [value, min, max, step, animateFillTo, percentFromValue, setValue]
  );

  const [dodge, setDodge] = useState({ left: 38, right: 72 });

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const measure = () => {
      const trackWidth = wrapper.offsetWidth;
      if (trackWidth <= 0) return;

      const labelEl = labelRef.current;
      const valueEl = valueRef.current;

      const left = labelEl
        ? ((LABEL_OFFSET + labelEl.offsetWidth + HANDLE_BUFFER) / trackWidth) *
          100
        : 38;

      const right = valueEl
        ? ((trackWidth - VALUE_OFFSET - valueEl.offsetWidth - HANDLE_BUFFER) /
            trackWidth) *
          100
        : 72;

      setDodge((prev) =>
        prev.left === left && prev.right === right ? prev : { left, right }
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    if (labelRef.current) observer.observe(labelRef.current);
    if (valueRef.current) observer.observe(valueRef.current);

    return () => observer.disconnect();
  }, [label, displayValue]);

  const valueDodge = percentage < dodge.left || percentage > dodge.right;
  const handleOpacity = isActive ? (valueDodge ? 0.4 : 1) : 0;

  const discreteSteps = (max - min) / step;
  const hashMarkCount = discreteSteps <= 10 ? discreteSteps - 1 : 9;

  const hashMarkPct = (i: number) => {
    return discreteSteps <= 10
      ? (((i + 1) * step) / (max - min)) * 100
      : (i + 1) * 10;
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("relative h-8 w-full select-none", className)}
    >
      <motion.div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        data-active={isActive}
        data-focus-visible={keyboardFocusRing}
        aria-label={label}
        aria-orientation="horizontal"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={displayValue}
        className={cn(
          "group/slider bg-background/90 hover:bg-background absolute inset-0 cursor-pointer touch-none overflow-hidden rounded-lg border-0 transition-colors outline-none dark:bg-neutral-900/90 dark:hover:bg-neutral-900",
          "data-[focus-visible=true]:ring-ring/50 data-[focus-visible=true]:ring-1"
        )}
        style={{ width: rubberWidth, x: rubberX }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onFocus={() => {
          if (!pendingPointerFocusRef.current) setKeyboardFocusRing(true);
        }}
        onBlur={() => setKeyboardFocusRing(false)}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {Array.from({ length: hashMarkCount }, (_, i) => (
            <div
              key={i}
              className={cn(
                "absolute top-1/2 h-2 w-px -translate-y-1/2 transition-colors duration-150",
                "bg-foreground/20 group-data-[active=true]/slider:bg-foreground/35"
              )}
              style={{ left: `${hashMarkPct(i)}%` }}
            />
          ))}
        </div>

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 bg-emerald-500/30 transition-colors group-data-[active=true]/slider:bg-emerald-500/40 dark:bg-emerald-500/40 dark:group-data-[active=true]/slider:bg-emerald-500/50"
          style={{ width: fillWidth }}
        />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-emerald-600 dark:bg-emerald-400"
          style={{ left: handleLeft }}
          animate={{
            opacity: handleOpacity,
            scaleY: isActive ? 1.15 : 0.8,
          }}
          transition={{ duration: 0.15 }}
        />

        <span
          ref={labelRef}
          aria-hidden="true"
          className="text-foreground/90 pointer-events-none absolute top-1/2 left-3 inline-flex -translate-y-1/2 items-center font-mono text-xs font-semibold"
        >
          {label}
        </span>

        <span
          ref={valueRef}
          aria-hidden="true"
          className="text-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs font-bold tabular-nums"
        >
          {displayValue}
        </span>
      </motion.div>
    </div>
  );
}
