import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import {
  Lexend,
  JetBrains_Mono,
  Noto_Sans_Bengali,
  Noto_Sans,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import Figlet from "@/components/figlet";
import ClickSpark from "@/components/ui/click-spark";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  weight: ["400", "700"],
});

const notoHindi = Noto_Sans({
  variable: "--font-noto-hindi",
  subsets: ["devanagari"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arkiv.hirishi.in"),
  title: "Arkiv",
  description: "Augmented Retrieval Chatbot",
  robots: "index, follow",
  creator: "Anabas Labs",
  authors: [
    { name: "Anabas Labs", url: "https://anabaslabs.com" },
    { name: "Saptarshi Roy", url: "https://hirishi.in" },
    { name: "Krishnendu Das", url: "https://itskdhere.com" },
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: "https://arkiv.hirishi.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        lexend.variable,
        jetbrainsMono.variable,
        notoBengali.variable,
        notoHindi.variable,
        "font-mono",
        "h-full",
        "antialiased"
      )}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClickSpark className="flex min-h-screen w-full flex-col">
            <Figlet />
            <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
            <Toaster position="top-center" richColors />
          </ClickSpark>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
