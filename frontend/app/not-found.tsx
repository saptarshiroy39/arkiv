import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { IconMessage } from "@tabler/icons-react";
import { MorphingText } from "@/components/ui/morphing-text";

export const metadata: Metadata = {
  title: "404 - Not Found | Arkiv",
  description:
    "The requested resource could not be found. Please check the URL or return to the application to continue.",
};

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-4xl">
        <MorphingText
          texts={["404", "Not Found"]}
          className="font-mono text-primary font-bold text-5xl sm:text-7xl md:text-8xl lg:text-9xl h-20 sm:h-28 md:h-36 lg:h-40"
        />
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
