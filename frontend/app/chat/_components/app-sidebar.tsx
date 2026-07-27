"use client";

import { IconPlus, IconTrash, IconRotateRectangle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { ChatSession } from "@/app/chat/types";
import { useEffect, useRef } from "react";

interface AppSidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteAll: () => void;
  onDeleteChat: (id: string) => void;
  isLoading?: boolean;
  isDeletingAll?: boolean;
  deletingChatId?: string | null;
}

export function AppSidebar({
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteAll,
  onDeleteChat,
  isLoading,
  isDeletingAll,
  deletingChatId,
}: AppSidebarProps) {
  const { state, open, isMobile, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const userLargeScreenPreference = useRef(true);

  const lastWidth = useRef(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    if (isMobile) return;

    const handleResize = () => {
      const width = window.innerWidth;
      const wasLarge = lastWidth.current >= 1280;
      const isLarge = width >= 1280;

      if (!isLarge && wasLarge) {
        userLargeScreenPreference.current = openRef.current;
        setOpen(false);
      } else if (isLarge && !wasLarge) {
        setOpen(userLargeScreenPreference.current);
      }
      lastWidth.current = width;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, setOpen]);

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex h-14 flex-row items-center justify-between px-4",
          isCollapsed && "h-auto flex-col gap-2 px-0 pt-2 pb-0"
        )}
      >
        <SidebarTrigger
          className={cn("size-10 [&_svg]:size-5", !isCollapsed && "-ml-1")}
        />
        <AnimatedThemeToggler
          variant="rectangle"
          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex size-10 items-center justify-center transition-colors"
          title={isCollapsed ? "Toggle theme" : undefined}
        />
      </SidebarHeader>
      <SidebarContent
        className={cn("space-y-4 p-2", isCollapsed && "space-y-2 px-1 pt-2")}
      >
        <Button
          onClick={onNewChat}
          variant="ghost"
          className={cn(
            "hover:bg-sidebar-accent h-10 w-full justify-start gap-3 px-2 text-sm font-bold transition-all",
            isCollapsed && "size-10 justify-center p-0"
          )}
          title={isCollapsed ? "NEW CHAT" : undefined}
        >
          <IconPlus size={20} stroke={2.5} />
          {!isCollapsed && <span>NEW CHAT</span>}
        </Button>

        {!isCollapsed && (
          <div className="mt-2 space-y-1">
            <p className="text-muted-foreground px-2 text-[10px] font-medium tracking-wider uppercase">
              Recent Chats
            </p>
            <SidebarMenu>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <IconRotateRectangle className="text-primary size-6 animate-spin" />
                  <p className="text-muted-foreground animate-pulse text-[10px] font-medium tracking-wider uppercase">
                    Loading chats...
                  </p>
                </div>
              ) : (
                <>
                  {chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        isActive={activeChatId === chat.id}
                        onClick={() => onChatSelect(chat.id)}
                        className={cn(
                          "h-10 px-2 text-sm transition-colors",
                          "font-normal data-active:bg-transparent data-active:font-normal",
                          activeChatId === chat.id
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span>{chat.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        className={cn(
                          "hover:text-destructive size-7 hover:bg-transparent data-active:bg-transparent",
                          deletingChatId === chat.id
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        disabled={deletingChatId === chat.id}
                      >
                        {deletingChatId === chat.id ? (
                          <IconRotateRectangle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <IconTrash size={16} />
                        )}
                        <span className="sr-only">Delete Chat</span>
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                  ))}
                  {chats.length === 0 && (
                    <p className="text-muted-foreground px-2 py-4 text-center text-xs italic">
                      No chats yet
                    </p>
                  )}
                </>
              )}
            </SidebarMenu>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className={cn("border-t p-2", isCollapsed && "px-1")}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-full justify-start gap-3 px-2 text-sm font-bold transition-all",
                isCollapsed && "size-10 justify-center p-0"
              )}
              disabled={chats.length === 0 || isDeletingAll}
              title={isCollapsed ? "DELETE ALL" : undefined}
            >
              {isDeletingAll ? (
                <IconRotateRectangle size={20} className="animate-spin" />
              ) : (
                <IconTrash size={20} stroke={2.5} />
              )}
              {!isCollapsed && (
                <span>{isDeletingAll ? "DELETING..." : "DELETE ALL"}</span>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your chat history and uploaded
                files context.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>CANCEL</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteAll}
                variant="destructive"
                className=""
              >
                DELETE ALL
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </Sidebar>
  );
}
