"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/swipe-toast";

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
}

interface SpeechRecognitionItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionItem;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResult;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

const getSpeechRecognition = ():
  | (new () => SpeechRecognitionInstance)
  | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

const join = (a: string, b: string) =>
  [a.trim(), b.trim()].filter(Boolean).join(" ");

export function useSpeechRecognition({
  onResult,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldListenRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang =
        (typeof navigator !== "undefined" &&
          (navigator.languages?.[0] || navigator.language)) ||
        "en-US";

      shouldListenRef.current = true;
      finalTranscriptRef.current = "";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (!item?.[0]) continue;

          const text = item[0].transcript;
          if (item.isFinal) {
            finalTranscriptRef.current = join(finalTranscriptRef.current, text);
          } else {
            interim = join(interim, text);
          }
        }

        const full = join(finalTranscriptRef.current, interim);
        if (full) {
          onResultRef.current?.(full);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const error = event.error;
        if (error === "no-speech" || error === "aborted") return;

        if (error === "not-allowed") {
          toast.error("Microphone access was denied.");
        }
        stopListening();
      };

      recognition.onend = () => {
        // Auto-restart if user did not click stop (keeps listening across pauses)
        if (shouldListenRef.current) {
          try {
            recognition.start();
          } catch {
            setTimeout(() => {
              if (shouldListenRef.current) {
                try {
                  recognition.start();
                } catch {
                  setIsListening(false);
                }
              }
            }, 100);
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      toast.error("Could not start microphone.");
      setIsListening(false);
    }
  }, [stopListening]);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
  };
}
