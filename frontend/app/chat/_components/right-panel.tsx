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
          <h2 className="text-sm font-bold">{files.length} Files</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground size-10"
          >
            <IconFilesOff size={24} />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {files.map((file, i) => (
              <div key={i} className="group flex h-12 items-center gap-3 p-2">
                <div className="bg-primary/5 dark:bg-primary/10 text-primary border-primary/20 flex size-10 shrink-0 items-center justify-center border dark:text-emerald-400">
                  {(() => {
                    const Icon = getFileIcon(file.name);
                    return <Icon size={20} />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium" title={file.name}>
                    {truncateFileName(file.name, 25)}
                  </p>
                  <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
