"use client";

import Image from "next/image";

export default function OG() {
  return (
    <main className="bg-sidebar text-foreground flex min-h-screen w-full flex-col items-center justify-center gap-8 p-6">
      <div className="flex max-w-6xl flex-col items-center justify-center gap-4 text-center">
        <h1 className="mb-2 flex items-center justify-center gap-2 text-2xl leading-none font-bold">
          <Image src="/logo.png" alt="Arkiv Logo" width={64} height={64} />
          <span className="text-foreground font-mono text-6xl">ARKIV</span>
        </h1>
        <h2 className="text-muted-foreground text-2xl font-bold tracking-tight">
          RAG Application
        </h2>
        <h3 className="text-foreground mb-4 text-3xl font-medium tracking-tight">
          Upload • Process • Ask
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2 font-semibold">
          {["PDF", "CSV", "TXT", "MD", "JSON", "TEX"].map((format) => (
            <span
              key={format}
              className="bg-primary text-primary-foreground p-3 text-lg font-medium"
            >
              {format}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 font-semibold">
          {["DOCX", "XLSX", "PPTX"].map((format) => (
            <span
              key={format}
              className="bg-primary text-primary-foreground p-3 text-lg font-medium"
            >
              {format}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
