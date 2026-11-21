"use client";

import { useRef } from "react";
import { IconX, IconPlus, IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UploadedFile } from "@/app/chat/types";
import {
  truncateFileName,
  formatFileSize,
  getFileIcon,
  MAX_FILE_COUNT,
} from "@/app/chat/utils";
import { LatticeLoader } from "@/components/ui/lattice-loader";

interface FilesViewProps {
  files: UploadedFile[];
  onAddFile: (files: FileList | null) => void;
  onStartChat: () => void;
  onRemoveFile: (index: number) => void;
  uploadStatus?: {
    status: "idle" | "working" | "done" | "error";
    elapsed?: number;
  };
  onResetUploadStatus?: () => void;
}

export function FilesView({
  files,
  onAddFile,
  onStartChat,
  onRemoveFile,
  uploadStatus = { status: "idle" },
  onResetUploadStatus,
}: FilesViewProps) {
  const isUploading =
    uploadStatus.status === "working" || uploadStatus.status === "done";
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-sidebar relative flex min-h-0 flex-1 flex-col items-center justify-start space-y-4 overflow-y-auto p-4 sm:justify-center sm:space-y-8 sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Ready to explore..?
      </h2>

      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          onAddFile(e.target.files);
          e.target.value = "";
        }}
        accept=".pdf,.csv,.txt,.md,.json,.tex,.docx,.xlsx,.pptx"
      />

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {files.map((file, i) => {
          const Icon = getFileIcon(file.name);
          return (
            <Card
              key={`${file.name}-${file.size}`}
              className={cn(
                "group relative flex h-36 flex-col items-center justify-center gap-3 border-0 bg-neutral-200/70 p-4 text-center shadow-none transition-colors hover:bg-neutral-200/90 dark:bg-neutral-800/80 dark:hover:bg-neutral-800/95",
                isUploading && "opacity-50 grayscale-[0.5]"
              )}
            >
              <div className="bg-primary/10 text-primary group-hover:bg-primary/15 flex size-12 items-center justify-center rounded-lg border-0 transition-all duration-200 group-hover:scale-105 dark:bg-emerald-500/20 dark:text-emerald-400 dark:group-hover:bg-emerald-500/25">
                <Icon size={24} />
              </div>
              <div className="w-full min-w-0 px-2">
                <p className="truncate text-sm font-semibold" title={file.name}>
                  {truncateFileName(file.name, 28)}
                </p>
                <p className="text-muted-foreground mt-1 text-[10px] font-medium tracking-wider uppercase">
                  {formatFileSize(file.size)}
                </p>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 absolute top-2 right-2 size-7 rounded-md transition-colors dark:hover:bg-red-500/20 dark:hover:text-red-400"
                  onClick={() => onRemoveFile(i)}
                  title="Remove file"
                >
                  <IconX size={15} stroke={2} />
                  <span className="sr-only">Remove file</span>
                </Button>
              )}
            </Card>
          );
        })}
        {!isUploading && files.length < MAX_FILE_COUNT && (
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-accent/50 flex h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all"
          >
            <IconPlus size={24} />
            <span className="text-xs font-medium">ADD MORE</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        {uploadStatus.status === "idle" ? (
          <Button
            size="lg"
            className="group h-10 w-full gap-2 px-8 sm:w-auto"
            onClick={onStartChat}
          >
            <span>ANALYZE</span>
            <IconArrowRight
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          </Button>
        ) : (
          <div
            className={cn(
              "flex h-10 items-center justify-center rounded-md px-4",
              uploadStatus.status === "error" &&
                "hover:bg-muted/40 cursor-pointer"
            )}
            onClick={() => {
              if (uploadStatus.status === "error") {
                onResetUploadStatus?.();
              }
            }}
            title={
              uploadStatus.status === "error" ? "Click to retry" : undefined
            }
          >
            <LatticeLoader
              status={uploadStatus.status}
              elapsed={uploadStatus.elapsed}
              label="Processing..."
              doneLabel="Done in"
              errorLabel="Failed after"
              shape="square"
              color="#8a8a8e"
              glowColor="#8a8a8e"
            />
          </div>
        )}
      </div>
    </div>
  );
}
