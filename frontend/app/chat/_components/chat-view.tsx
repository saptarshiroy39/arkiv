"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  IconRotateRectangle,
  IconArrowUp,
  IconMicrophone,
  IconMicrophoneFilled,
  IconFileTextSpark,
} from "@tabler/icons-react";
import { Markdown } from "@/components/markdown";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Message } from "@/app/chat/types";

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
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
}

export function ChatView({
  messages,
  inputValue,
  isAsking,
  onInputChange,
  onSendMessage,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
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
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isAsking]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  return (
    <div className="bg-sidebar relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1 px-4 md:px-6" ref={scrollRef}>
        <div className="mx-auto max-w-4xl space-y-6 py-4 pb-40">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "animate-in fade-in slide-in-from-bottom-2 group flex w-full flex-col duration-300",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[90%] text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-primary/10 text-foreground border-primary/20 border px-4 py-2.5"
                    : "bg-transparent"
                )}
              >
                <Markdown content={message.content} />
              </div>
              <div className="mt-1">
                <CopyButton content={message.content} />
              </div>
            </div>
          ))}
          {isAsking && (
            <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full flex-col items-start duration-300">
              <div className="flex items-center gap-2 rounded-none bg-transparent px-4 py-2.5 text-sm leading-relaxed">
                <IconRotateRectangle className="text-primary size-4 animate-spin" />
                <span className="text-muted-foreground animate-pulse font-medium">
                  Arkiv is thinking...
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex flex-col">
        <div className="from-sidebar h-10 bg-linear-to-t to-transparent" />
        <div className="bg-sidebar pointer-events-auto px-4 pb-3">
          <div className="group relative mx-auto w-[95%] max-w-4xl sm:w-full">
            <div className="absolute bottom-2 left-3 z-10 flex items-center sm:bottom-3">
              <Button
                size="icon"
                variant="ghost"
                className="text-primary hover:text-primary! bg-primary/5 dark:bg-primary/10 hover:bg-primary/10! border-primary/20 size-8 rounded-none border shadow-none dark:text-emerald-400"
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
              className="border-primary/20 bg-sidebar-accent/50 focus-visible:border-primary/50 max-h-40 min-h-12 resize-none overflow-y-auto rounded-none border py-3 pr-22 pl-13 text-sm leading-relaxed whitespace-pre-wrap antialiased backdrop-blur-sm transition-all [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-0 sm:min-h-14 sm:py-4.5 [&::-webkit-scrollbar]:hidden"
            />
            <div className="absolute right-3 bottom-2 z-10 flex items-center gap-1.5 sm:bottom-3">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "border-primary/20 size-8 rounded-none border shadow-none transition-none",
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
                className="size-8 rounded-none"
                disabled={!inputValue.trim() || isAsking}
                onClick={handleSend}
                title="Send message"
              >
                {isAsking ? (
                  <IconRotateRectangle className="size-4 animate-spin" />
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
