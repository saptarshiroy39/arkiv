"use client";

import { IconArrowDown } from "@tabler/icons-react";
import { Markdown } from "@/components/markdown";
import { CopyButton } from "@/components/copy-button";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import { cn } from "@/lib/utils";
import { Message } from "@/app/chat/types";
import { LatticeLoader } from "@/components/ui/lattice-loader";
import { parseCitations } from "@/lib/citations";
import { Citations } from "@/components/citations";
import { PromptBar } from "@/components/ui/prompt-bar";
import { useChat } from "./chat-context";

interface ChatViewProps {
  messages: Message[];
  inputValue: string;
  isAsking: boolean;
  askingStatus?: {
    status: "working" | "done" | "error";
    elapsed?: number;
  };
  onInputChange: (val: string) => void;
  onSendMessage: (overrideText?: string) => void;
  onStop?: () => void;
}

export function ChatView({
  messages,
  inputValue,
  isAsking,
  askingStatus,
  onInputChange,
  onSendMessage,
  onStop,
}: ChatViewProps) {
  const { settings, updateSettings } = useChat();


  const handleSummarize = () => {
    onInputChange("Summarize the uploaded documents.");
    setTimeout(onSendMessage, 0);
  };

  return (
    <div className="bg-sidebar relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <MessageScrollerProvider>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport className="px-4 md:px-6">
            <MessageScrollerContent className="mx-auto max-w-4xl gap-6 py-4 pb-40">
              {messages.map((message) => {
                const isAssistant = message.role === "assistant";
                const { processedContent, citations, copyText } = isAssistant
                  ? parseCitations(message.content)
                  : {
                      processedContent: message.content,
                      citations: [],
                      copyText: message.content,
                    };

                return (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={false}
                    className={cn(
                      "animate-in fade-in slide-in-from-bottom-2 group flex w-full flex-col duration-300",
                      message.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-primary/10 dark:bg-emerald-500/20 text-foreground max-w-[90%] rounded-lg px-4 py-2.5"
                          : "w-full max-w-[95%] bg-transparent"
                      )}
                    >
                      {message.role === "assistant" && message.status && (
                        <div className="mb-2.5">
                          <LatticeLoader
                            status={message.status}
                            elapsed={message.elapsed}
                            shape="square"
                            color="#8a8a8e"
                            glowColor="#8a8a8e"
                          />
                        </div>
                      )}
                      <Markdown content={processedContent} />
                      {citations.length > 0 && (
                        <div className="mt-3">
                          <Citations citations={citations} />
                        </div>
                      )}
                    </div>
                    <div className="mt-1">
                      <CopyButton content={copyText} />
                    </div>
                  </MessageScrollerItem>
                );
              })}
              {isAsking && (
                <MessageScrollerItem
                  messageId="thinking"
                  scrollAnchor={false}
                  className="animate-in fade-in slide-in-from-bottom-2 flex w-full flex-col items-start duration-300"
                >
                  <div className="flex items-center rounded-md bg-transparent py-2.5 text-sm leading-relaxed">
                    <LatticeLoader
                      status={askingStatus?.status ?? "working"}
                      elapsed={askingStatus?.elapsed}
                      shape="square"
                      color="#8a8a8e"
                      glowColor="#8a8a8e"
                    />
                  </div>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton
            direction="end"
            variant="default"
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground hover:text-primary-foreground! bottom-40! size-7 rounded-md border-0 shadow-none"
          >
            <IconArrowDown size={18} stroke={2.5} />
            <span className="sr-only">Scroll to end</span>
          </MessageScrollerButton>
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex flex-col">
        <div className="from-sidebar h-10 bg-linear-to-t to-transparent" />
        <div className="bg-sidebar pointer-events-auto px-4 pb-3">
          <PromptBar
            placeholder="Ask Arkiv..."
            value={inputValue}
            onChange={onInputChange}
            busy={isAsking}
            onSend={onSendMessage}
            onStop={onStop}
            onSummarize={handleSummarize}
            onDictate
            topK={settings.top_k}
            temperature={settings.temperature}
            scoreThreshold={settings.score_threshold}
            onParamChange={(key, val) => updateSettings({ [key]: val })}
            className="mx-auto w-[95%] max-w-4xl sm:w-full"
          />
          <p className="text-muted-foreground mt-3 text-center text-[10px]">
            <span className="font-mono">Arkiv</span> is AI and can make
            mistakes.
          </p>
        </div>
      </div>
    </div>
  );
}
