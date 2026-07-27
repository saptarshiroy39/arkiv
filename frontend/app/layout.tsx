import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import Figlet from "@/components/figlet";
import ClickSpark from "@/components/ui/click-spark";
import "./globals.css";

const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://arkiv.hirishi.in"),
  title: "Arkiv",
  description: "Augmented Retrieval Chatbot. Upload, Process, Ask.",
  applicationName: "Arkiv",
  robots: "index, follow",

  creator: "Saptarshi Roy",
  authors: [
    { name: "Saptarshi Roy", url: "https://hirishi.in" },
    { name: "Krishnendu Das", url: "https://itskdhere.com" },
  ],

  keywords: [
    "Arkiv",
    "arkiv.hirishi.in",
    "https://arkiv.hirishi.in",
    "Augmented Retrieval Chatbot",
    "RAG",
    "Retrieval Augmented Generation",
    "Saptarshi Roy",
    "saptarshiroy39",
    "hirishi",
    "hirishi.in",
    "https://hirishi.in",
    "Document Chatbot",
    "Chat with PDF",
    "Chat with Excel",
    "Vector Search",
    "Pinecone",
    "Gemini",
    "FastAPI",
    "Next.js",
    "AI Assistant",
  ],

  openGraph: {
    title: "Arkiv",
    siteName: "Arkiv",
    description: "Augmented Retrieval Chatbot. Upload, Process, Ask.",
    url: "https://arkiv.hirishi.in",
    images: [
      {
        url: "https://arkiv.hirishi.in/OG.png",
        width: 1200,
        height: 630,
        alt: "Arkiv",
      },
    ],
    type: "website",
    locale: "en_US",
  },

  twitter: {
    title: "Arkiv",
    description: "Augmented Retrieval Chatbot. Upload, Process, Ask.",
    images: ["https://arkiv.hirishi.in/OG.png"],
    site: "@saptarshiroy39",
    creator: "@saptarshiroy39",
    card: "summary_large_image",
  },

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
      className={cn("h-full", "antialiased", "font-mono", geistMono.variable)}
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
