"use client";

import * as React from "react";
import { toast } from "@/components/ui/swipe-toast";
import { ChatSession } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ArkivSettings {
  top_k: number;
  temperature: number;
  score_threshold: number;
  chunk_size: number;
  chunk_overlap: number;
}

export const DEFAULT_SETTINGS: ArkivSettings = {
  top_k: 10,
  temperature: 0.2,
  score_threshold: 0.45,
  chunk_size: 800,
  chunk_overlap: 100,
};

interface ChatContextType {
  chats: ChatSession[];
  setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  isLoadingChats: boolean;
  isDeletingAll: boolean;
  deletingChatId: string | null;
  deleteChat: (id: string) => Promise<void>;
  deleteAllChats: (onSuccess?: () => void) => Promise<void>;
  settings: ArkivSettings;
  updateSettings: (newSettings: Partial<ArkivSettings>) => void;
}

const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

const emptySubscribe = () => () => {};

function deduplicateChats(chats: ChatSession[]): ChatSession[] {
  const seen = new Set<string>();
  return chats.filter((chat) => {
    if (!chat || !chat.id || seen.has(chat.id)) return false;
    seen.add(chat.id);
    return true;
  });
}

function getSavedChats(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("arkiv_chats");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    const deduplicated = deduplicateChats(parsed);
    if (deduplicated.length !== parsed.length) {
      localStorage.setItem("arkiv_chats", JSON.stringify(deduplicated));
    }
    return deduplicated;
  } catch (error) {
    console.error("Failed to load chats:", error);
    return [];
  }
}

function getSavedSettings(): ArkivSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem("arkiv_settings");
    if (!saved) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(saved);
    return {
      top_k:
        typeof parsed.top_k === "number"
          ? parsed.top_k
          : DEFAULT_SETTINGS.top_k,
      temperature:
        typeof parsed.temperature === "number"
          ? parsed.temperature
          : DEFAULT_SETTINGS.temperature,
      score_threshold:
        typeof parsed.score_threshold === "number"
          ? parsed.score_threshold
          : DEFAULT_SETTINGS.score_threshold,
      chunk_size:
        typeof parsed.chunk_size === "number"
          ? parsed.chunk_size
          : DEFAULT_SETTINGS.chunk_size,
      chunk_overlap:
        typeof parsed.chunk_overlap === "number"
          ? parsed.chunk_overlap
          : DEFAULT_SETTINGS.chunk_overlap,
    };
  } catch (error) {
    console.error("Failed to load settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [localChats, setLocalChats] = React.useState<ChatSession[] | null>(
    null
  );
  const [isDeletingAll, setIsDeletingAll] = React.useState(false);
  const [deletingChatId, setDeletingChatId] = React.useState<string | null>(
    null
  );

  const chats = React.useMemo(() => {
    if (!isMounted) return [];
    return localChats ?? getSavedChats();
  }, [isMounted, localChats]);

  const isLoadingChats = !isMounted;

  const setChats: React.Dispatch<React.SetStateAction<ChatSession[]>> =
    React.useCallback((action) => {
      setLocalChats((prev) => {
        const current = prev ?? getSavedChats();
        const updated =
          typeof action === "function"
            ? (action as (prev: ChatSession[]) => ChatSession[])(current)
            : action;
        const deduplicated = deduplicateChats(updated);
        try {
          localStorage.setItem("arkiv_chats", JSON.stringify(deduplicated));
        } catch (error) {
          console.error("Failed to save chats:", error);
        }
        return deduplicated;
      });
    }, []);

  const deleteChat = async (id: string) => {
    setDeletingChatId(id);
    try {
      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete chat");

      setChats((prev) => prev.filter((c) => c.id !== id));
      localStorage.removeItem(`arkiv_messages_${id}`);
      localStorage.removeItem(`arkiv_files_${id}`);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete chat data.");
      throw error;
    } finally {
      setDeletingChatId(null);
    }
  };

  const deleteAllChats = async (onSuccess?: () => void) => {
    setIsDeletingAll(true);
    try {
      const response = await fetch(`${API_URL}/clear`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to clear index");

      setChats([]);
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith("arkiv_messages_") ||
          key.startsWith("arkiv_files_") ||
          key === "arkiv_chats"
        ) {
          localStorage.removeItem(key);
        }
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Clear error:", error);
      toast.error("Failed to clear backend data.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const [localSettings, setLocalSettings] =
    React.useState<ArkivSettings | null>(null);

  const settings = React.useMemo(() => {
    if (!isMounted) return DEFAULT_SETTINGS;
    return localSettings ?? getSavedSettings();
  }, [isMounted, localSettings]);

  const updateSettings = React.useCallback(
    (newSettings: Partial<ArkivSettings>) => {
      setLocalSettings((prev) => {
        const current = prev ?? getSavedSettings();
        const updated = { ...current, ...newSettings };
        try {
          localStorage.setItem("arkiv_settings", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save settings:", e);
        }
        return updated;
      });
    },
    []
  );

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        isLoadingChats,
        isDeletingAll,
        deletingChatId,
        deleteChat,
        deleteAllChats,
        settings,
        updateSettings,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
