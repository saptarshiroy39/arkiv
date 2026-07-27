"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconAlertSquare, IconRefresh, IconHome } from "@tabler/icons-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-sidebar flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-6 duration-500">
        <div className="bg-destructive/10 flex h-20 w-20 items-center justify-center">
          <IconAlertSquare className="text-destructive h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mx-auto max-w-md text-sm sm:text-base">
            {error.message?.toLowerCase().includes("file") &&
            (error.message?.toLowerCase().includes("limit") ||
              error.message?.toLowerCase().includes("size") ||
              error.message?.toLowerCase().includes("exceed"))
              ? "File size limit exceeded. Max 5MB/File."
              : "An unexpected error occurred"}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={reset}
            className="flex h-10 items-center gap-2"
            size="default"
          >
            <IconRefresh size={20} />
            TRY AGAIN
          </Button>
          <Button
            variant="outline"
            asChild
            size="default"
            className="flex h-10 items-center gap-2"
          >
            <Link href="/">
              <IconHome size={20} />
              BACK TO HOME
            </Link>
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="bg-muted mt-8 max-w-2xl overflow-auto rounded-none p-4 text-left font-mono text-xs text-red-500">
            <p className="mb-2 font-bold">
              {error.name}: {error.message}
            </p>
            <pre className="whitespace-pre-wrap">{error.stack}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
