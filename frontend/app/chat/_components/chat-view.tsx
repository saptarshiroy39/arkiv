"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "@/components/ui/swipe-toast";
import {
  IconArrowUp,
  IconMicrophone,
  IconMicrophoneFilled,
  IconFileTextSpark,
} from "@tabler/icons-react";
import { Blocks } from "loading-dev";
import { Markdown } from "@/components/markdown";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface ChatViewProps {
  messages: Message[];
  inputValue: string;
  isAsking: boolean;
  askingStatus?: {
    status: "working" | "done" | "error";
    elapsed?: number;
  };
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
}

export function ChatView({
  messages,
  inputValue,
  isAsking,
  askingStatus,
  onInputChange,
  onSendMessage,
}: ChatViewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onInputChangeRef = useRef(onInputChange);

  useEffect(() => {
    onInputChangeRef.current = onInputChange;
  }, [onInputChange]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (
          window as unknown as {
            SpeechRecognition: SpeechRecognitionConstructor;
          }
        ).SpeechRecognition ||
        (
          window as unknown as {
            webkitSpeechRecognition: SpeechRecognitionConstructor;
          }
        ).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(
            event.results as unknown as SpeechRecognitionResult[]
          )
            .map((result: SpeechRecognitionResult) => result[0].transcript)
            .join("");
          onInputChangeRef.current(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          if (event.error !== "no-speech") {
            toast.error(`Voice input error: ${event.error}`);
          }
        };

        recognitionRef.current = recognition;

        return () => {
          recognition.abort();
        };
      }
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        toast.error("Speech recognition is not supported in your browser.");
      }
    }
  }, [isListening]);

  const handleSend = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    }
    onSendMessage();
  }, [isListening, onSendMessage]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

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
                          ? "bg-primary/10 text-foreground border-primary/20 max-w-[90%] rounded-[4px] border px-4 py-2.5"
                          : "w-full max-w-[95%] bg-transparent"
                      )}
                    >
                      {message.role === "assistant" && message.status && (
                        <div className="mb-2.5">
                          <LatticeLoader
                            status={message.status}
                            elapsed={message.elapsed}
                            pattern="spiral"
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
                  <div className="flex items-center rounded-[4px] bg-transparent py-2.5 text-sm leading-relaxed">
                    <LatticeLoader
                      status={askingStatus?.status ?? "working"}
                      elapsed={askingStatus?.elapsed}
                      pattern="spiral"
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
            className="bg-primary hover:bg-primary/80 text-primary-foreground hover:text-primary-foreground! bottom-32! size-8 rounded-[4px] border-0 shadow-none"
          />
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex flex-col">
        <div className="from-sidebar h-10 bg-linear-to-t to-transparent" />
        <div className="bg-sidebar pointer-events-auto px-4 pb-3">
          <div className="group relative mx-auto w-[95%] max-w-4xl sm:w-full">
            <div className="absolute bottom-2 left-3 z-10 flex items-center sm:bottom-3">
              <Button
                size="icon"
                variant="ghost"
                className="text-primary hover:text-primary! bg-primary/5 dark:bg-primary/10 hover:bg-primary/10! border-primary/20 size-8 rounded-[4px] border shadow-none dark:text-emerald-400"
                onClick={() => {
                  onInputChange("Summarize the uploaded documents.");
                  setTimeout(onSendMessage, 0);
                }}
                title="Summarize documents"
              >
                <IconFileTextSpark size={20} />
              </Button>
            </div>
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Arkiv..."
              className="border-primary/20 bg-sidebar-accent/50 focus-visible:border-primary/50 max-h-40 min-h-12 resize-none overflow-y-auto rounded-[4px] border py-3 pr-22 pl-13 text-sm leading-relaxed whitespace-pre-wrap antialiased backdrop-blur-sm transition-all [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-0 sm:min-h-14 sm:py-4.5 [&::-webkit-scrollbar]:hidden"
            />
            <div className="absolute right-3 bottom-2 z-10 flex items-center gap-1.5 sm:bottom-3">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "border-primary/20 size-8 rounded-[4px] border shadow-none transition-none",
                  isListening
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/10! hover:text-red-500!"
                    : "text-primary hover:text-primary! bg-primary/5 dark:bg-primary/10 hover:bg-primary/10! dark:text-emerald-400"
                )}
                onClick={toggleListening}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? (
                  <IconMicrophoneFilled size={20} />
                ) : (
                  <IconMicrophone size={20} />
                )}
              </Button>
              <Button
                size="icon"
                className="size-8 rounded-[4px]"
                disabled={!inputValue.trim() || isAsking}
                onClick={handleSend}
                title="Send message"
              >
                {isAsking ? (
                  <Blocks size={16} sweep="diagonal" />
                ) : (
                  <IconArrowUp size={20} />
                )}
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-center text-[10px]">
            <span className="font-mono">Arkiv</span> is AI and can make
            mistakes.
          </p>
        </div>
      </div>
    </div>
  );
}
