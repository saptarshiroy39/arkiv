"use client";

import { IconPlus, IconTrash, IconSettings } from "@tabler/icons-react";
import { Blocks } from "loading-dev";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
import { cn } from "@/lib/utils";
import { ChatSession } from "@/app/chat/types";
import { useEffect, useRef, useState } from "react";
import { SettingsDialog } from "./settings-dialog";

interface AppSidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteAll: () => void;
  onDeleteChat: (id: string) => void;
  isLoading?: boolean;
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
  deletingChatId,
}: AppSidebarProps) {
  const { state, open, isMobile, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
          className={cn(
            "size-10 rounded-[4px] [&_svg]:size-5",
            !isCollapsed && "-ml-1"
          )}
        />
        <ThemeToggle
          variant="circle-blur"
          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex size-10 items-center justify-center rounded-[4px] transition-colors"
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
            "hover:bg-sidebar-accent h-10 w-full justify-start gap-3 rounded-[4px] px-2 text-sm font-bold transition-all",
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
                  <Blocks
                    size={24}
                    sweep="diagonal"
                    className="text-primary dark:text-emerald-400"
                  />
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
                          "h-10 rounded-[4px] px-2 text-sm transition-colors",
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
                          "hover:text-destructive size-7 rounded-[4px] hover:bg-transparent data-active:bg-transparent",
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
                          <Blocks
                            size={14}
                            sweep="diagonal"
                            className="text-destructive"
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
        <Button
          variant="ghost"
          onClick={() => setIsSettingsOpen(true)}
          className={cn(
            "hover:bg-sidebar-accent h-10 w-full justify-start gap-3 rounded-[4px] px-2 text-sm font-bold transition-all",
            isCollapsed && "size-10 justify-center p-0"
          )}
          title={isCollapsed ? "SETTINGS" : undefined}
        >
          <IconSettings size={20} stroke={2.5} />
          {!isCollapsed && <span>SETTINGS</span>}
        </Button>

        <SettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          onDeleteAll={onDeleteAll}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
