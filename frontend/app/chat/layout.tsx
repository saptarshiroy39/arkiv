"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { ChatProvider, useChat } from "./_components/chat-context";

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const initialChatId = (params.id as string[] | undefined)?.[0];

  const {
    chats,
    isLoadingChats,
    isDeletingAll,
    deletingChatId,
    deleteChat,
    deleteAllChats,
  } = useChat();

  const handleChatSelect = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await deleteChat(id);
      if (initialChatId === id) {
        handleNewChat();
      }
    } catch {}
  };

  const handleDeleteAll = async () => {
    await deleteAllChats(() => {
      handleNewChat();
    });
  };

  return (
    <SidebarProvider>
      <div className="bg-background text-foreground flex h-screen w-full overflow-hidden">
        <AppSidebar
          chats={chats}
          activeChatId={initialChatId || null}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onDeleteAll={handleDeleteAll}
          onDeleteChat={handleDeleteChat}
          isLoading={isLoadingChats}
          isDeletingAll={isDeletingAll}
          deletingChatId={deletingChatId}
        />
        {children}
      </div>
    </SidebarProvider>
  );
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </ChatProvider>
  );
}
