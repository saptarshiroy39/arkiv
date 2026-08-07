"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

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
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeKatex, [rehypeHighlight, { detect: true }]]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            />
          ),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          pre: ({ node, ...props }) => (
            <pre
              {...props}
              className="text-foreground bg-muted/30 border-border scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent my-4 overflow-x-auto border p-4"
            />
          ),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");

            return isInline ? (
              <code
                {...props}
                className={cn(
                  "text-foreground bg-muted/50 px-1.5 py-0.5 font-mono text-sm",
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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          table: ({ node, ...props }) => (
            <div className="border-border my-4 overflow-x-auto border">
              <table {...props} className="w-full border-collapse text-left" />
            </div>
          ),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="border-border bg-muted/30 border-b px-4 py-2 font-semibold"
            />
          ),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          td: ({ node, ...props }) => (
            <td {...props} className="border-border border-b px-4 py-2" />
          ),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-primary/30 text-muted-foreground my-4 border-l-4 pl-4 italic"
            />
          ),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ul: ({ node, ...props }) => (
            <ul {...props} className="my-2 list-disc pl-6" />
          ),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ol: ({ node, ...props }) => (
            <ol {...props} className="my-2 list-decimal pl-6" />
          ),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          li: ({ node, ...props }) => <li {...props} className="my-0.5" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
