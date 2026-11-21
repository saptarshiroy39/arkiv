"use client";

import { IconFilesOff } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadedFile } from "@/app/chat/types";
import {
  truncateFileName,
  formatFileSize,
  getFileIcon,
} from "@/app/chat/utils";
import { cn } from "@/lib/utils";

interface RightPanelProps {
  files: UploadedFile[];
  onClose: () => void;
  isOpen: boolean;
}

export function RightPanel({ files, onClose, isOpen }: RightPanelProps) {
  return (
    <div
      className="group/right-panel peer text-sidebar-foreground"
      data-state={isOpen ? "expanded" : "collapsed"}
    >
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/10 backdrop-blur-xs transition-opacity duration-100 md:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "relative hidden w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-in-out md:block",
          !isOpen && "w-0"
        )}
      />

      <aside
        className={cn(
          "bg-sidebar md:bg-sidebar/80 fixed inset-y-0 right-0 z-50 flex h-svh w-[85vw] flex-col border-l transition-[left,right,width] duration-200 ease-in-out sm:w-(--sidebar-width) md:z-10",
          !isOpen && "-right-full sm:-right-(--sidebar-width)"
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between p-4">
          <h2 className="text-sm font-bold">{files.length} File(s)</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground size-7 rounded-md transition-colors"
          >
            <IconFilesOff size={24} />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {files.map((file, i) => {
              const Icon = getFileIcon(file.name);
              return (
                <div
                  key={i}
                  className="group hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-14 items-center gap-3 rounded-lg p-2 transition-colors"
                >
                  <div className="bg-primary/10 text-primary group-hover:bg-primary/15 flex size-10 shrink-0 items-center justify-center rounded-lg border-0 transition-colors duration-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:group-hover:bg-emerald-500/25">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-xs font-medium"
                      title={file.name}
                    >
                      {truncateFileName(file.name, 25)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-[10px] tracking-wider uppercase">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
