"use client";

import * as React from "react";
import { toast } from "sonner";
import { ChatSession } from "../types";
import { formatChatTitle } from "../utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChatContextType {
  chats: ChatSession[];
  setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  isLoadingChats: boolean;
  isDeletingAll: boolean;
  deletingChatId: string | null;
  fetchChats: () => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  deleteAllChats: (onSuccess?: () => void) => Promise<void>;
}

const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = React.useState<ChatSession[]>([]);
  const [isLoadingChats, setIsLoadingChats] = React.useState(false);
  const [isDeletingAll, setIsDeletingAll] = React.useState(false);
  const [deletingChatId, setDeletingChatId] = React.useState<string | null>(
    null
  );

  const fetchChats = React.useCallback(async () => {
    setIsLoadingChats(true);
    try {
      const response = await fetch(`${API_URL}/chats`);
      if (response.ok) {
        const data = await response.json();
        const fetchedChats = (data.chats || []).map((chat: ChatSession) => ({
          ...chat,
          title: formatChatTitle(chat.id),
        }));
        setChats(fetchedChats);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
      toast.error("Could not sync chat history.");
    } finally {
      setIsLoadingChats(false);
    }
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
          key.startsWith("arkiv_files_")
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

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        isLoadingChats,
        isDeletingAll,
        deletingChatId,
        fetchChats,
        deleteChat,
        deleteAllChats,
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
