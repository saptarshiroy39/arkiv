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
        "prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none",
        "prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        className
      )}
    >
      <ReactMarkdown
        urlTransform={(url) => url}
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeKatex, [rehypeHighlight, { detect: true }]]}
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
              className="text-foreground bg-muted/30 border-border scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent my-4 overflow-x-auto rounded-[4px] border p-4"
            />
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");

            return isInline ? (
              <code
                {...clean(props)}
                className={cn(
                  "text-foreground bg-muted/50 rounded-[4px] px-1.5 py-0.5 font-mono text-sm",
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
            <div className="border-border my-4 overflow-x-auto rounded-[4px] border">
              <table
                {...clean(props)}
                className="w-full border-collapse text-left"
              />
            </div>
          ),
          th: (props) => (
            <th
              {...clean(props)}
              className="border-border bg-muted/30 border-b px-4 py-2 font-semibold"
            />
          ),
          td: (props) => (
            <td
              {...clean(props)}
              className="border-border border-b px-4 py-2"
            />
          ),
          blockquote: (props) => (
            <blockquote
              {...clean(props)}
              className="border-primary/30 text-muted-foreground my-4 rounded-r-[4px] border-l-4 pl-4 italic"
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
