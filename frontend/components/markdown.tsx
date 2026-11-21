"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";
import { Citation } from "@/components/citations";

interface MarkdownProps {
  content: string;
  className?: string;
}

function clean<T extends object>(props: T): Omit<T, "node"> {
  const { node: _, ...rest } = props as T & { node?: unknown };
  void _;
  return rest;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none wrap-break-word",
        "prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none prose-table:my-0",
        "prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        className
      )}
    >
      <ReactMarkdown
        urlTransform={(url) => url}
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[
          [rehypeKatex, { strict: false, throwOnError: false }],
          [rehypeHighlight, { detect: true }],
        ]}
        components={{
          a: ({ href, children, ...props }) => {
            if (
              href?.startsWith("#citation-") ||
              href?.startsWith("citation:")
            ) {
              const raw = href
                .replace(/^#citation-/, "")
                .replace(/^citation:/, "");
              const index = parseInt(raw || String(children), 10) || 1;
              return <Citation index={index} />;
            }

            return (
              <a
                {...clean(props)}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {children}
              </a>
            );
          },
          pre: (props) => (
            <pre
              {...clean(props)}
              className="text-foreground bg-muted/30 border-border scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent my-4 overflow-x-auto rounded-lg border p-4"
            />
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");

            return isInline ? (
              <code
                {...clean(props)}
                className={cn(
                  "text-foreground bg-muted/50 rounded-sm px-1.5 py-0.5 font-mono text-sm",
                  className
                )}
              >
                {children}
              </code>
            ) : (
              <code
                {...clean(props)}
                className={cn("text-foreground font-mono text-sm", className)}
              >
                {children}
              </code>
            );
          },
          table: (props) => (
            <div className="border-border my-4 overflow-x-auto rounded-lg border">
              <table
                {...clean(props)}
                className="my-0! w-full border-collapse text-left text-sm"
              />
            </div>
          ),
          thead: (props) => (
            <thead
              {...clean(props)}
              className="border-border bg-muted/40 border-b"
            />
          ),
          tr: (props) => (
            <tr
              {...clean(props)}
              className="border-border hover:bg-muted/20 border-b transition-colors last:border-b-0"
            />
          ),
          th: (props) => (
            <th
              {...clean(props)}
              className="text-foreground px-4 py-2.5 text-left font-semibold"
            />
          ),
          td: (props) => (
            <td
              {...clean(props)}
              className="text-foreground/90 px-4 py-2.5 align-middle"
            />
          ),
          blockquote: (props) => (
            <blockquote
              {...clean(props)}
              className="border-primary/30 text-muted-foreground my-4 rounded-r-md border-l-4 pl-4 italic"
            />
          ),
          ul: (props) => (
            <ul {...clean(props)} className="my-2 list-disc pl-6" />
          ),
          ol: (props) => (
            <ol {...clean(props)} className="my-2 list-decimal pl-6" />
          ),
          li: (props) => <li {...clean(props)} className="my-0.5" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
