"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  IconSquareCheck,
  IconInfoSquare,
  IconAlertSquare,
  IconX,
} from "@tabler/icons-react";

export type SwipeToastCloseReason =
  | "timeout"
  | "swipe"
  | "action"
  | "close"
  | "escape"
  | "programmatic";
export type SwipeToastFuse = "bottom" | "top" | "none";
export type SwipeToastPhase = "open" | "closing" | "gone";

export interface SwipeToastProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actionLabel?: ReactNode;
  onAction?: () => void;
  open?: boolean;
  onClose?: (reason: SwipeToastCloseReason) => void;
  background?: string;
  color?: string;
  fuseColor?: string;
  width?: number;
  radius?: number;
  slideMs?: number;
  settleBounce?: number;
  swipeDistance?: number;
  duration?: number;
  fuse?: SwipeToastFuse;
  pauseOnHover?: boolean;
  closeButton?: boolean;
  inline?: boolean;
  dismissible?: boolean;
  className?: string;
}

type Sample = [number, number];

interface Drag {
  id: number;
  startY: number;
  grab: number | null;
  moved: boolean;
  hist: Sample[];
}

interface Latest {
  onClose?: (reason: SwipeToastCloseReason) => void;
  onAction?: () => void;
  slideMs: number;
  inline: boolean;
}

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const FLICK = 0.11;
const DEAD_ZONE = 3;
const RESIST_PX = 24;
const COLLAPSE_MS = 200;
const EXIT = 0.7;
const BURN = [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }];

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const rubberband = (over: number, dim: number, c = 0.55) =>
  (over * dim * c) / (dim + c * Math.abs(over));

const velocityOf = (hist: Sample[]) => {
  if (hist.length < 2) return 0;
  const [t0, y0] = hist[0];
  const [t1, y1] = hist[hist.length - 1];
  return performance.now() - t1 > 100 ? 0 : (y1 - y0) / Math.max(1, t1 - t0);
};

export const SwipeToast: React.FC<SwipeToastProps> = ({
  title = "Notification",
  description = "",
  icon,
  actionLabel = "",
  onAction,
  open = true,
  onClose,
  background = "var(--sidebar-accent)",
  color = "var(--foreground)",
  fuseColor = "#10b981",
  width = 356,
  radius = 8,
  slideMs = 400,
  settleBounce = 0.2,
  swipeDistance = 40,
  duration = 4000,
  fuse = "none",
  pauseOnHover = true,
  closeButton = true,
  inline = true,
  dismissible = true,
  className = "",
}) => {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<SwipeToastPhase>("open");
  const [instant, setInstant] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const fuseRef = useRef<HTMLElement>(null);
  const anim = useRef<Animation | null>(null);
  const drag = useRef<Drag | null>(null);
  const flags = useRef({
    hover: false,
    interacting: false,
    focus: false,
    hidden: false,
  });
  const lastInput = useRef<"pointer" | "keyboard">("pointer");
  const pendingClose = useRef<SwipeToastCloseReason | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const leaving = useRef(false);
  const phaseRef = useRef(phase);

  useIsomorphicLayoutEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const latest = useRef<Latest>({ slideMs, inline });
  useIsomorphicLayoutEffect(() => {
    latest.current = { onClose, onAction, slideMs, inline };
  });

  const y = useMotionValue(0);
  const fade = useMotionValue(1);
  const transform = useTransform(y, (v) => `translateY(${v}px)`);

  const syncFuse = () => {
    const a = anim.current;
    if (!a) return;
    const f = flags.current;
    if (f.hover || f.interacting || f.focus || f.hidden) a.pause();
    else if (a.playState === "paused") a.play();
  };

  const finish = (why: SwipeToastCloseReason) => {
    setPhase("gone");
    leaving.current = false;
    if (latest.current.inline) {
      closeTimer.current = setTimeout(
        () => latest.current.onClose?.(why),
        COLLAPSE_MS
      );
    } else {
      latest.current.onClose?.(why);
    }
  };

  const close = (why: SwipeToastCloseReason) => {
    if (phaseRef.current !== "open" || leaving.current) return;
    if (drag.current) {
      pendingClose.current = why;
      return;
    }
    anim.current?.pause();
    const now =
      why === "escape" ||
      ((why === "action" || why === "close") &&
        lastInput.current === "keyboard");
    setInstant(now);
    setPhase("closing");
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(
      () => finish(why),
      now ? 0 : latest.current.slideMs * EXIT + 60
    );
  };

  const rescue = () => {
    clearTimeout(closeTimer.current);
    setInstant(false);
    y.set(0);
    fade.set(1);
    setPhase("open");
  };

  useEffect(() => {
    if (!open) close("programmatic");
    else if (phaseRef.current !== "open") rescue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (phase !== "open" || duration <= 0 || !fuseRef.current) return undefined;
    anim.current?.cancel();
    const a = fuseRef.current.animate(BURN, {
      duration,
      easing: "linear",
      fill: "forwards",
    });
    a.onfinish = () => close("timeout");
    anim.current = a;
    syncFuse();
    return () => {
      a.onfinish = null;
      a.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, duration]);

  useEffect(() => {
    if (!pauseOnHover) {
      flags.current.hover = false;
      syncFuse();
    }
  }, [pauseOnHover]);

  useEffect(() => {
    const onVisibility = () => {
      flags.current.hidden = document.hidden;
      syncFuse();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(closeTimer.current);
      anim.current?.cancel();
    };
  }, []);

  const swipeOut = (dy: number, v: number) => {
    anim.current?.pause();
    leaving.current = true;
    pendingClose.current = null;
    if (!reduce && cardRef.current) {
      animate(y, dy + cardRef.current.offsetHeight, {
        type: "spring",
        duration: 0.3,
        bounce: 0,
        velocity: v * 1000,
      });
    }
    animate(fade, 0, { duration: 0.2, ease: EASE_OUT }).then(() =>
      finish("swipe")
    );
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    lastInput.current = "pointer";
    if (
      e.button !== 0 ||
      !dismissible ||
      drag.current ||
      leaving.current ||
      (e.target as HTMLElement).closest("button")
    )
      return;
    if (phaseRef.current === "closing") rescue();
    try {
      cardRef.current?.setPointerCapture(e.pointerId);
    } catch {}
    y.stop();
    drag.current = {
      id: e.pointerId,
      startY: e.clientY,
      grab: null,
      moved: false,
      hist: [[performance.now(), y.get()]],
    };
    flags.current.interacting = true;
    syncFuse();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.grab === null) {
      if (Math.abs(e.clientY - d.startY) < DEAD_ZONE) return;
      d.grab = e.clientY - y.get();
      if (cardRef.current) cardRef.current.dataset.swiping = "";
    }
    const raw = e.clientY - d.grab;
    const next = raw >= 0 ? raw : rubberband(raw, RESIST_PX);
    y.set(next);
    d.moved = true;
    d.hist.push([performance.now(), next]);
    if (d.hist.length > 4) d.hist.shift();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (cardRef.current) delete cardRef.current.dataset.swiping;
    try {
      cardRef.current?.releasePointerCapture(e.pointerId);
    } catch {}
    flags.current.interacting = false;
    const dy = y.get();
    const v = velocityOf(d.hist);
    if (dy > 0 && (v > FLICK || (dy >= swipeDistance && v >= 0))) {
      swipeOut(dy, v);
      return;
    }
    if (d.moved) {
      animate(
        y,
        0,
        reduce
          ? { duration: 0.2, ease: EASE_OUT }
          : {
              type: "spring",
              duration: 0.5,
              bounce: settleBounce,
              velocity: v * 1000,
            }
      );
    }
    const queued = pendingClose.current;
    pendingClose.current = null;
    if (queued) close(queued);
    else syncFuse();
  };

  return (
    <div
      className={`group grid w-[min(var(--st-w),100%)] [grid-template-rows:1fr] text-[13px] leading-normal [color:var(--st-ink)] data-[inline=false]:fixed data-[inline=false]:right-8 data-[inline=false]:bottom-[calc(32px+env(safe-area-inset-bottom,0px))] data-[inline=false]:z-[999999999] data-[inline=false]:w-[min(var(--st-w),calc(100vw-64px))] data-[inline=true]:[transition:grid-template-rows_var(--st-slide)_cubic-bezier(0.23,1,0.32,1)] data-[inline=true]:data-[mounted=false]:[grid-template-rows:0fr] data-[inline=true]:data-[phase=closing]:[grid-template-rows:0fr] data-[inline=true]:data-[phase=closing]:[transition-duration:calc(var(--st-slide)*0.7)] data-[inline=true]:data-[phase=gone]:[grid-template-rows:0fr] max-[600px]:data-[inline=false]:right-4 max-[600px]:data-[inline=false]:bottom-[calc(16px+env(safe-area-inset-bottom,0px))] max-[600px]:data-[inline=false]:w-[min(var(--st-w),calc(100vw-32px))] data-[inline=true]:starting:[grid-template-rows:0fr] data-[inline=true]:data-[phase=gone]:[transition-duration:200ms]${
        className ? ` ${className}` : ""
      }`}
      data-phase={phase}
      data-inline={inline ? "true" : "false"}
      data-fuse={duration > 0 ? fuse : "none"}
      data-dismissible={dismissible ? "true" : "false"}
      data-instant={instant ? "" : undefined}
      data-mounted={mounted ? "true" : "false"}
      style={
        {
          "--st-bg": background,
          "--st-ink": color,
          "--st-fuse": fuseColor,
          "--st-w": `${width}px`,
          "--st-radius": `${radius}px`,
          "--st-slide": `${slideMs}ms`,
          "--st-gap": "10px",
        } as CSSProperties
      }
    >
      <div className="min-h-0">
        <div className="[transform:translateY(0)] opacity-100 [transition:transform_var(--st-slide)_cubic-bezier(0.23,1,0.32,1),opacity_calc(var(--st-slide)*0.6)_ease] group-data-[inline=true]:mt-[var(--st-gap)] group-data-[instant]:[transition-duration:0s] group-data-[mounted=false]:[transform:translateY(100%)] group-data-[mounted=false]:opacity-0 group-data-[phase=closing]:[transform:translateY(100%)] group-data-[phase=closing]:opacity-0 group-data-[phase=closing]:[transition:transform_calc(var(--st-slide)*0.7)_cubic-bezier(0.23,1,0.32,1),opacity_calc(var(--st-slide)*0.5)_ease] group-data-[phase=gone]:invisible group-data-[phase=gone]:[transform:translateY(100%)] group-data-[phase=gone]:opacity-0 motion-reduce:[transform:none]! motion-reduce:[transition:opacity_200ms_ease] starting:[transform:translateY(100%)] starting:opacity-0">
          <motion.div
            ref={cardRef}
            className="relative flex cursor-grab touch-none items-center gap-2.5 overflow-hidden [border-radius:var(--st-radius)] border-0 p-3.5 font-mono shadow-none outline-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [background:var(--st-bg)] group-data-[dismissible=false]:cursor-default group-data-[dismissible=false]:touch-auto data-[swiping]:cursor-grabbing"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            tabIndex={0}
            style={{ transform, opacity: fade }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerEnter={(e) => {
              if (pauseOnHover && e.pointerType === "mouse") {
                flags.current.hover = true;
                syncFuse();
              }
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") {
                flags.current.hover = false;
                syncFuse();
              }
            }}
            onFocus={() => {
              flags.current.focus = true;
              syncFuse();
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                flags.current.focus = false;
                syncFuse();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                lastInput.current = "keyboard";
              if (e.key === "Escape" && dismissible) {
                e.stopPropagation();
                close("escape");
              }
            }}
          >
            {icon ? (
              <span
                className="inline-flex size-[18px] shrink-0 items-center justify-center [&_svg]:size-full"
                aria-hidden="true"
              >
                {icon}
              </span>
            ) : null}
            <span className="flex min-w-0 flex-auto flex-col gap-0.5">
              <span className="text-foreground font-mono text-sm leading-snug font-semibold tracking-wide">
                {title}
              </span>
              {description ? (
                <span className="text-muted-foreground font-mono text-xs leading-normal">
                  {description}
                </span>
              ) : null}
            </span>
            {actionLabel ? (
              <button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-6.5 flex-none cursor-pointer touch-manipulation rounded-md border-0 px-2.5 [font-family:inherit] font-mono text-xs font-bold outline-none [-webkit-tap-highlight-color:transparent] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1),opacity_160ms_ease] active:[transform:scale(0.97)] motion-reduce:active:[transform:none]"
                onClick={() => {
                  latest.current.onAction?.();
                  close("action");
                }}
              >
                {actionLabel}
              </button>
            ) : null}
            {closeButton ? (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground hover:bg-sidebar-accent relative grid size-6 flex-none cursor-pointer touch-manipulation place-items-center rounded-md border-0 bg-transparent [font-family:inherit] outline-none [-webkit-tap-highlight-color:transparent] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1),background-color_160ms_ease] before:absolute before:-inset-2 before:content-[''] active:[transform:scale(0.97)] motion-reduce:active:[transform:none]"
                aria-label="Close"
                onClick={() => close("close")}
              >
                <IconX size={14} stroke={2.5} />
              </button>
            ) : null}
            <i
              ref={fuseRef}
              className="pointer-events-none absolute right-0 bottom-0 left-0 h-0.5 origin-left [background:linear-gradient(90deg,transparent_0%,color-mix(in_srgb,var(--st-fuse)_18%,transparent)_9%,color-mix(in_srgb,var(--st-fuse)_50%,transparent)_18%,color-mix(in_srgb,var(--st-fuse)_84%,transparent)_28%,var(--st-fuse)_38%,var(--st-fuse)_62%,color-mix(in_srgb,var(--st-fuse)_84%,transparent)_72%,color-mix(in_srgb,var(--st-fuse)_50%,transparent)_82%,color-mix(in_srgb,var(--st-fuse)_18%,transparent)_91%,transparent_100%)] group-data-[fuse=none]:opacity-0 group-data-[fuse=top]:top-0 group-data-[fuse=top]:bottom-auto"
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SwipeToast;

export type ToastType = "default" | "success" | "error" | "info" | "warning";

export interface ToastOptions {
  description?: ReactNode;
  icon?: ReactNode;
  action?: {
    label: ReactNode;
    onClick: () => void;
  };
  actionLabel?: ReactNode;
  onAction?: () => void;
  duration?: number;
  width?: number;
  radius?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
  title: ReactNode;
  type: ToastType;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function emit() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function createToast(
  title: ReactNode,
  type: ToastType = "default",
  options?: ToastOptions
) {
  const id =
    Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const newToast: ToastItem = {
    id,
    title,
    type,
    ...options,
  };
  toasts = [...toasts, newToast];
  emit();
  return id;
}

export const toast = (title: ReactNode, options?: ToastOptions) =>
  createToast(title, "default", options);

toast.success = (title: ReactNode, options?: ToastOptions) =>
  createToast(title, "success", options);

toast.error = (title: ReactNode, options?: ToastOptions) =>
  createToast(title, "error", options);

toast.info = (title: ReactNode, options?: ToastOptions) =>
  createToast(title, "info", options);

toast.warning = (title: ReactNode, options?: ToastOptions) =>
  createToast(title, "warning", options);

toast.dismiss = (id?: string) => {
  if (id) {
    dismissToast(id);
  } else {
    toasts = [];
    emit();
  }
};

const emptySnapshot: ToastItem[] = [];

export function useToasts() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    () => toasts,
    () => emptySnapshot
  );
}

export function Toaster() {
  const toastList = useToasts();

  if (toastList.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-5 bottom-5 z-[99999] flex max-w-[calc(100vw-32px)] flex-col items-end gap-2.5"
      aria-live="polite"
      aria-atomic="true"
    >
      {toastList.map((t) => {
        let icon = t.icon;
        if (!icon) {
          if (t.type === "success") {
            icon = (
              <IconSquareCheck className="size-4.5 shrink-0 text-emerald-500" />
            );
          } else if (t.type === "error") {
            icon = (
              <IconAlertSquare className="text-destructive size-4.5 shrink-0" />
            );
          } else if (t.type === "warning") {
            icon = (
              <IconAlertSquare className="size-4.5 shrink-0 text-amber-500" />
            );
          } else if (t.type === "info") {
            icon = (
              <IconInfoSquare className="text-primary size-4.5 shrink-0 dark:text-emerald-400" />
            );
          }
        }

        const actionLabel = t.action?.label ?? t.actionLabel;
        const onAction = t.action?.onClick ?? t.onAction;

        return (
          <SwipeToast
            key={t.id}
            inline={true}
            open={true}
            fuse="none"
            pauseOnHover={true}
            closeButton={true}
            radius={t.radius ?? 4}
            width={t.width ?? 356}
            duration={t.duration ?? 3800}
            title={t.title}
            description={t.description}
            icon={icon}
            actionLabel={actionLabel}
            onAction={onAction}
            onClose={() => dismissToast(t.id)}
            className="pointer-events-auto"
          />
        );
      })}
    </div>
  );
}
