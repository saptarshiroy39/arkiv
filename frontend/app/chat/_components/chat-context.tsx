"use client";

import * as React from "react";
import { toast } from "@/components/ui/swipe-toast";
import { ChatSession } from "../types";
import { API_URL } from "../utils";
import {
  chatStore,
  type ArkivSettings,
  DEFAULT_SETTINGS,
} from "@/lib/chat-store";

export type { ArkivSettings };

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
    return localChats ?? chatStore.getStoredChats();
  }, [isMounted, localChats]);

  const isLoadingChats = !isMounted;

  const setChats: React.Dispatch<React.SetStateAction<ChatSession[]>> =
    React.useCallback((action) => {
      setLocalChats((prev) => {
        const current = prev ?? chatStore.getStoredChats();
        const updated =
          typeof action === "function"
            ? (action as (prev: ChatSession[]) => ChatSession[])(current)
            : action;
        chatStore.saveStoredChats(updated);
        return updated;
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
      chatStore.deleteStoredSession(id);
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
      chatStore.clearAllStoredSessions();
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
    return localSettings ?? chatStore.getStoredSettings();
  }, [isMounted, localSettings]);

  const updateSettings = React.useCallback(
    (newSettings: Partial<ArkivSettings>) => {
      setLocalSettings((prev) => {
        const current = prev ?? chatStore.getStoredSettings();
        const updated = { ...current, ...newSettings };
        chatStore.saveStoredSettings(updated);
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
