import { CitationItem } from "@/components/citations";

export interface ParsedCitationsResult {
  processedContent: string;
  citations: CitationItem[];
  copyText: string;
}

export function parseCitations(content: string): ParsedCitationsResult {
  if (!content) {
    return { processedContent: "", citations: [], copyText: "" };
  }

  const citationRegex =
    /`?\(\s*Source:\s*([^,\n]+?)(?:,\s*Page:\s*([^)\n]+?))?\s*\)`?/gi;

  const citationsMap = new Map<string, { item: CitationItem; index: number }>();
  const citations: CitationItem[] = [];
  let indexCounter = 1;

  const processedContent = content.replace(
    citationRegex,
    (match, rawFileName: string, rawPage?: string) => {
      const fileName = rawFileName.trim();
      const page = rawPage ? rawPage.trim() : undefined;
      const key = `${fileName}::${page || ""}`;

      let citationInfo = citationsMap.get(key);

      if (!citationInfo) {
        const item: CitationItem = {
          id: `source-${indexCounter}`,
          fileName,
          page,
        };
        citationInfo = { item, index: indexCounter };
        citationsMap.set(key, citationInfo);
        citations.push(item);
        indexCounter++;
      }

      return `[${citationInfo.index}](#citation-${citationInfo.index})`;
    }
  );

  let copyText = processedContent.replace(/\(#citation-\d+\)/g, "");

  if (citations.length > 0) {
    const sourcesList = citations
      .map(
        (c, i) =>
          `[${i + 1}] ${c.fileName}${c.page ? ` (Page ${c.page})` : ""}`
      )
      .join("\n");
    copyText = `${copyText}\n\nSource(s):\n${sourcesList}`;
  }

  return {
    processedContent,
    citations,
    copyText,
  };
}
