import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { IconMessage } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "404 - Not Found | Arkiv",
  description:
    "The requested resource could not be found. Please check the URL or return to the application to continue.",
};

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="space-y-2">
        <h1 className="animate-flicker text-primary text-7xl font-bold tracking-tighter sm:text-9xl md:text-[12rem] lg:text-[16rem]">
          404
        </h1>
        <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase sm:text-lg md:text-xl lg:text-3xl">
          Not Found
        </p>
      </div>

      <div className="mt-16">
        <Button
          asChild
          variant="outline"
          className="hover:bg-primary/10 hover:text-primary h-8 rounded-none px-3 font-mono text-[10px] transition-colors sm:h-9 sm:px-4 sm:text-xs md:h-10 md:px-5 md:text-sm lg:h-12 lg:px-6 lg:text-base"
        >
          <Link href="/">
            <IconMessage className="mr-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            New Chat
          </Link>
        </Button>
      </div>
    </div>
  );
}
