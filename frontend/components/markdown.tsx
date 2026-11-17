"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

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
          a: ({ node: _node, href, children, ...props }) => {
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
                {...props}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {children}
              </a>
            );
          },
          pre: ({ node: _node, ...props }) => (
            <pre
              {...props}
              className="text-foreground bg-muted/30 border-border scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent my-4 overflow-x-auto rounded-[4px] border p-4"
            />
          ),
          code: ({ node: _node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");

            return isInline ? (
              <code
                {...props}
                className={cn(
                  "text-foreground bg-muted/50 rounded-[4px] px-1.5 py-0.5 font-mono text-sm",
                  className
                )}
              >
                {children}
              </code>
            ) : (
              <code
                {...props}
                className={cn("text-foreground font-mono text-sm", className)}
              >
                {children}
              </code>
            );
          },
          table: ({ node: _node, ...props }) => (
            <div className="border-border my-4 overflow-x-auto rounded-[4px] border">
              <table {...props} className="w-full border-collapse text-left" />
            </div>
          ),
          th: ({ node: _node, ...props }) => (
            <th
              {...props}
              className="border-border bg-muted/30 border-b px-4 py-2 font-semibold"
            />
          ),
          td: ({ node: _node, ...props }) => (
            <td {...props} className="border-border border-b px-4 py-2" />
          ),
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              {...props}
              className="border-primary/30 text-muted-foreground my-4 rounded-r-[4px] border-l-4 pl-4 italic"
            />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul {...props} className="my-2 list-disc pl-6" />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol {...props} className="my-2 list-decimal pl-6" />
          ),
          li: ({ node: _node, ...props }) => <li {...props} className="my-0.5" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
