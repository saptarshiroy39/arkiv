"use client";

import { IconBook } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface CitationItem {
  id: string;
  fileName: string;
  page?: string | number;
}

export interface CitationProps {
  index: number;
  className?: string;
}

export interface CitationsProps {
  citations: CitationItem[];
  className?: string;
}

export function CitationBadge({
  value,
  className,
}: {
  value: number | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] bg-[#8a8a8e]/[0.22] font-mono text-[11px] font-bold leading-none text-primary select-none dark:text-emerald-400",
        className
      )}
    >
      {value}
    </span>
  );
}

export function Citation({ index, className }: CitationProps) {
  return (
    <span className="not-prose mx-0.5 inline-block align-middle no-underline">
      <CitationBadge value={index} className={className} />
    </span>
  );
}

export function Citations({ citations, className }: CitationsProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center gap-2 font-mono text-sm font-medium text-foreground">
        <IconBook size={16} />
        <span>Source(s)</span>
        <CitationBadge value={citations.length} />
      </div>

      <div className="space-y-1">
        {citations.map((citation, i) => (
          <div
            key={citation.id || `${citation.fileName}-${i}`}
            className="flex items-center gap-2 py-0.5 text-sm"
          >
            <CitationBadge value={i + 1} />
            <span className="truncate font-mono font-medium text-foreground/90">
              {citation.fileName}
            </span>
            {citation.page ? (
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                Page {citation.page}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
