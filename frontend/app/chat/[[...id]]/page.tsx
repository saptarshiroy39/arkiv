"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { IconFilesFilled } from "@tabler/icons-react";
import { Blocks } from "loading-dev";
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
  const { setChats } = useChat();

  const [view, setView] = React.useState<ViewState>(
    initialChatId ? "chat" : "upload"
  );

  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>(
    () => {
      if (typeof window === "undefined" || !initialChatId) return [];
      const saved = localStorage.getItem(`arkiv_files_${initialChatId}`);
      return saved ? JSON.parse(saved) : [];
    }
  );

  const [messages, setMessages] = React.useState<Message[]>(() => {
    if (typeof window === "undefined" || !initialChatId) return [];
    const saved = localStorage.getItem(`arkiv_messages_${initialChatId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [inputValue, setInputValue] = React.useState("");
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<{
    status: "idle" | "working" | "done" | "error";
    elapsed?: number;
  }>({ status: "idle" });
  const isUploading =
    uploadStatus.status === "working" || uploadStatus.status === "done";
  const [isAsking, setIsAsking] = React.useState(false);
  const [askingStatus, setAskingStatus] = React.useState<{
    status: "working" | "done" | "error";
    elapsed?: number;
  }>({ status: "working" });

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

  const handleResetUploadStatus = () => {
    setUploadStatus({ status: "idle" });
  };

  const startChat = async () => {
    if (uploadedFiles.length === 0 || isUploading) return;

    setUploadStatus({ status: "working" });
    const startTime = performance.now();
    const newChatId = Date.now().toString();
    const formData = new FormData();
    uploadedFiles.forEach((f) => {
      if (f.file) formData.append("files", f.file);
    });
    formData.append("session_id", newChatId);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const elapsed =
        Math.round(((performance.now() - startTime) / 1000) * 10) / 10;
      setUploadStatus({ status: "done", elapsed });

      const newChat: ChatSession = {
        id: newChatId,
        title: formatChatTitle(newChatId),
        date: "Just now",
      };

      setChats((prev) => {
        if (prev.some((c) => c.id === newChat.id)) return prev;
        return [newChat, ...prev];
      });

      const initMessages: Message[] = [
        {
          id: "1",
          role: "assistant",
          content: "Your files have been processed. How can I help you today?",
        },
      ];

      setMessages(initMessages);
      localStorage.setItem(
        `arkiv_messages_${newChatId}`,
        JSON.stringify(initMessages)
      );

      const fileMetadata = uploadedFiles.map((f) => ({
        name: f.name,
        size: f.size,
      }));
      localStorage.setItem(
        `arkiv_files_${newChatId}`,
        JSON.stringify(fileMetadata)
      );

      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push(`/chat/${newChatId}`);
    } catch (error) {
      console.error("Upload error:", error);
      const elapsed =
        Math.round(((performance.now() - startTime) / 1000) * 10) / 10;
      setUploadStatus({ status: "error", elapsed });

      setTimeout(() => {
        setUploadStatus((current) =>
          current.status === "error" ? { status: "idle" } : current
        );
      }, 3500);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAsking || !initialChatId) return;

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
      `arkiv_messages_${initialChatId}`,
      JSON.stringify(newMessages)
    );
    setInputValue("");
    setAskingStatus({ status: "working" });
    setIsAsking(true);
    const startTime = performance.now();

    let isTimeout = false;
    const timeoutId = setTimeout(() => {
      isTimeout = true;
      controller.abort();
    }, 30000);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: inputValue,
          session_id: initialChatId,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Failed to get answer");

      const data = await response.json();
      const elapsed =
        Math.round(((performance.now() - startTime) / 1000) * 10) / 10;
      setAskingStatus({ status: "done", elapsed });
      await new Promise((resolve) => setTimeout(resolve, 350));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        status: "done",
        elapsed,
      };
      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      localStorage.setItem(
        `arkiv_messages_${initialChatId}`,
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        if (!isTimeout) return;
      }
      console.error("Ask error:", error);
      const warningMessage = isTimeout
        ? "Connection timeout. Please check your network."
        : "Connection error. Please check your internet.";

      toast.error(warningMessage);

      const elapsed =
        Math.round(((performance.now() - startTime) / 1000) * 10) / 10;
      setAskingStatus({ status: "error", elapsed });
      await new Promise((resolve) => setTimeout(resolve, 350));

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: isTimeout
          ? "The request timed out. The server took too long to respond."
          : "An error was encountered while processing your request.",
        status: "error",
        elapsed,
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      clearTimeout(timeoutId);
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
              <span className="font-mono text-xl leading-none font-bold">
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
              <UploadView onUpload={handleFileSelect} />
            )}
            {view === "files" && (
              <FilesView
                files={uploadedFiles}
                onAddFile={handleFileSelect}
                onStartChat={startChat}
                onRemoveFile={handleRemoveFile}
                uploadStatus={uploadStatus}
                onResetUploadStatus={handleResetUploadStatus}
              />
            )}
            {view === "chat" && (
              <ChatView
                messages={messages}
                inputValue={inputValue}
                isAsking={isAsking}
                askingStatus={askingStatus}
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
  const { isLoadingChats } = useChat();

  if (isLoadingChats) {
    return (
      <div className="bg-sidebar flex flex-1 flex-col items-center justify-center gap-4">
        <Blocks
          size={32}
          sweep="diagonal"
          className="text-primary dark:text-emerald-400"
        />
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
