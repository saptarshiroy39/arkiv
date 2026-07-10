"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { IconFilesFilled, IconRotateRectangle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { UploadView } from "../_components/upload-view";
import { FilesView } from "../_components/files-view";
import { ChatView } from "../_components/chat-view";
import { RightPanel } from "../_components/right-panel";
import { useChat } from "../_components/chat-context";
import { ViewState, Message, ChatSession, UploadedFile } from "../types";
import { MAX_FILE_SIZE, MAX_FILE_COUNT, formatChatTitle } from "../utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function ChatInterface({ initialChatId }: { initialChatId?: string }) {
  const router = useRouter();
  const { userId, chats, setChats } = useChat();

  const [view, setView] = React.useState<ViewState>(
    initialChatId ? "chat" : "upload"
  );

  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>(
    () => {
      if (typeof window === "undefined" || !initialChatId) return [];
      const saved = localStorage.getItem(`arc_files_${initialChatId}`);
      return saved ? JSON.parse(saved) : [];
    }
  );

  const [messages, setMessages] = React.useState<Message[]>(() => {
    if (typeof window === "undefined" || !initialChatId) return [];
    const saved = localStorage.getItem(`arc_messages_${initialChatId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [inputValue, setInputValue] = React.useState("");
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isAsking, setIsAsking] = React.useState(false);

  const abortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentFilesCount = uploadedFiles.length;
    const selectedFiles = Array.from(files);

    if (currentFilesCount + selectedFiles.length > MAX_FILE_COUNT) {
      toast.error(`You can only upload up to ${MAX_FILE_COUNT} files.`);
      return;
    }

    const filteredFiles = selectedFiles.filter((f) => f.size <= MAX_FILE_SIZE);
    if (filteredFiles.length < selectedFiles.length) {
      toast.error("Some files were skipped because they exceed the 5MB limit.");
    }

    if (filteredFiles.length === 0) return;

    const newFiles = filteredFiles.map((f) => ({
      name: f.name,
      size: f.size,
      file: f,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setView("files");
  };

  const handleRemoveFile = (index: number) => {
    if (isUploading) return;
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) setView("upload");
  };

  const startChat = async () => {
    if (uploadedFiles.length === 0 || isUploading || !userId) return;

    setIsUploading(true);
    const newChatId = Date.now().toString();
    const formData = new FormData();
    uploadedFiles.forEach((f) => {
      if (f.file) formData.append("files", f.file);
    });
    formData.append("session_id", newChatId);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { "X-User-ID": userId },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const newChat: ChatSession = {
        id: newChatId,
        title: formatChatTitle(newChatId),
        date: "Just now",
      };

      setChats([newChat, ...chats]);

      const initMessages: Message[] = [
        {
          id: "1",
          role: "assistant",
          content: "Your files have been processed. How can I help you today?",
        },
      ];

      setMessages(initMessages);
      localStorage.setItem(
        `arc_messages_${newChatId}`,
        JSON.stringify(initMessages)
      );

      const fileMetadata = uploadedFiles.map((f) => ({
        name: f.name,
        size: f.size,
      }));
      localStorage.setItem(
        `arc_files_${newChatId}`,
        JSON.stringify(fileMetadata)
      );

      router.push(`/chat/${newChatId}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAsking || !userId) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    localStorage.setItem(
      `arc_messages_${initialChatId}`,
      JSON.stringify(newMessages)
    );
    setInputValue("");
    setIsAsking(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId,
        },
        body: JSON.stringify({
          question: inputValue,
          session_id: initialChatId || "default_index",
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Failed to get answer");

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
      };
      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      localStorage.setItem(
        `arc_messages_${initialChatId}`,
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Ask error:", error);
      toast.error("Connection error. Please check your internet.");
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "An error was encountered while processing your request.",
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      if (abortControllerRef.current === controller) {
        setIsAsking(false);
      }
    }
  };

  return (
    <>
      <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="bg-sidebar border-border/50 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-2">
          <div className="flex items-center gap-1">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center gap-2 px-2">
              <Image
                src="/logo.png"
                alt="Arkiv Logo"
                height={32}
                width={32}
                priority
                className="object-contain"
              />
              <span className="font-lexend text-xl leading-none font-bold">
                ARKIV
              </span>
            </div>
          </div>
          {view === "chat" && !isRightPanelOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRightPanelOpen(true)}
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground size-10"
            >
              <IconFilesFilled size={20} />
            </Button>
          )}
        </header>

        <main className="relative flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col">
            {view === "upload" && (
              <UploadView
                onUpload={handleFileSelect}
                isUploading={isUploading}
              />
            )}
            {view === "files" && (
              <FilesView
                files={uploadedFiles}
                onAddFile={handleFileSelect}
                onStartChat={startChat}
                onRemoveFile={handleRemoveFile}
                isUploading={isUploading}
              />
            )}
            {view === "chat" && (
              <ChatView
                messages={messages}
                inputValue={inputValue}
                isAsking={isAsking}
                onInputChange={setInputValue}
                onSendMessage={handleSendMessage}
              />
            )}
          </div>
        </main>
      </SidebarInset>

      {view === "chat" && (
        <RightPanel
          files={uploadedFiles}
          onClose={() => setIsRightPanelOpen(false)}
          isOpen={isRightPanelOpen}
        />
      )}
    </>
  );
}

export default function ChatPage() {
  const params = useParams();
  const initialChatId = (params.id as string[] | undefined)?.[0];
  const { userId } = useChat();

  if (!userId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <IconRotateRectangle className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground animate-pulse text-sm font-medium">
          Initializing session...
        </p>
      </div>
    );
  }

  return (
    <ChatInterface key={initialChatId || "new"} initialChatId={initialChatId} />
  );
}
