"use client";

import { useRef } from "react";
import {
  IconX,
  IconPlus,
  IconRotateRectangle,
  IconArrowRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UploadedFile } from "@/app/chat/types";
import {
  truncateFileName,
  formatFileSize,
  getFileIcon,
} from "@/app/chat/utils";

interface FilesViewProps {
  files: UploadedFile[];
  onAddFile: (files: FileList | null) => void;
  onStartChat: () => void;
  onRemoveFile: (index: number) => void;
  isUploading: boolean;
}

export function FilesView({
  files,
  onAddFile,
  onStartChat,
  onRemoveFile,
  isUploading,
}: FilesViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-sidebar relative flex flex-1 flex-col items-center justify-center space-y-4 p-4 sm:space-y-8 sm:p-8">
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
        {files.map((file, i) => (
          <Card
            key={`${file.name}-${file.size}`}
            className={cn(
              "group relative flex h-36 flex-col items-center justify-center gap-3 p-4 text-center transition-all",
              isUploading && "opacity-50 grayscale-[0.5]"
            )}
          >
            <div className="bg-primary/5 dark:bg-primary/10 text-primary border-primary/20 flex size-12 items-center justify-center border transition-transform group-hover:scale-110 dark:text-emerald-400">
              {(() => {
                const Icon = getFileIcon(file.name);
                return <Icon size={24} />;
              })()}
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
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 absolute top-0 right-0 size-10"
                onClick={() => onRemoveFile(i)}
              >
                <IconX size={20} />
              </Button>
            )}
          </Card>
        ))}
        {!isUploading && files.length < 6 && (
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-accent/50 flex h-36 flex-col items-center justify-center gap-2 border-2 border-dashed transition-all"
          >
            <IconPlus size={24} />
            <span className="text-xs font-medium">ADD MORE</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <Button
          size="lg"
          className="group h-10 w-full gap-2 px-8 sm:w-auto"
          onClick={onStartChat}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <IconRotateRectangle className="size-5 animate-spin" />
              <span>PROCESSING...</span>
            </>
          ) : (
            <>
              <span>ANALYZE DOCUMENTS</span>
              <IconArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
