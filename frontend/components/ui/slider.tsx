"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export interface SliderProps extends React.ComponentProps<
  typeof SliderPrimitive.Root
> {
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  trackClassName,
  rangeClassName,
  thumbClassName,
  ...props
}: SliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center py-1 select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full bg-neutral-300 data-horizontal:h-[5px] data-horizontal:w-full data-vertical:h-full data-vertical:w-[5px] dark:bg-neutral-700",
          trackClassName
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute rounded-full bg-neutral-900 select-none data-horizontal:h-full data-vertical:w-full dark:bg-white",
            rangeClassName
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
            "block size-4 shrink-0 cursor-grab rounded-full border border-black/15 bg-white shadow-xs transition-transform select-none hover:scale-110 focus-visible:outline-none active:scale-95 active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-900/60",
            thumbClassName
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
