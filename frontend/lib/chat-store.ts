import type { ChatSession, Message, UploadedFile } from "@/app/chat/types";

export interface StoredSession {
  files: UploadedFile[];
  messages: Message[];
}

export interface ArkivSettings {
  top_k: number;
  temperature: number;
  score_threshold: number;
}

const CHATS_KEY = "arkiv_chats";
const SETTINGS_KEY = "arkiv_settings";
const SESSION_PREFIX = "arkiv_session_";
const LEGACY_MESSAGES_PREFIX = "arkiv_messages_";
const LEGACY_FILES_PREFIX = "arkiv_files_";

export const DEFAULT_SETTINGS: ArkivSettings = {
  top_k: 10,
  temperature: 0.2,
  score_threshold: 0.45,
};

function isClient(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeGetItem(key: string): string | null {
  if (!isClient()) return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error(`Failed to get localStorage key "${key}":`, e);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`Failed to set localStorage key "${key}":`, e);
  }
}

function safeRemoveItem(key: string): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Failed to remove localStorage key "${key}":`, e);
  }
}

export function deduplicateChats(chats: ChatSession[]): ChatSession[] {
  const seen = new Set<string>();
  return chats.filter((chat) => {
    if (!chat || !chat.id || seen.has(chat.id)) return false;
    seen.add(chat.id);
    return true;
  });
}

export const chatStore = {
  getStoredChats(): ChatSession[] {
    const raw = safeGetItem(CHATS_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const deduplicated = deduplicateChats(parsed);
      if (deduplicated.length !== parsed.length) {
        safeSetItem(CHATS_KEY, JSON.stringify(deduplicated));
      }
      return deduplicated;
    } catch {
      return [];
    }
  },

  saveStoredChats(chats: ChatSession[]): void {
    const deduplicated = deduplicateChats(chats);
    safeSetItem(CHATS_KEY, JSON.stringify(deduplicated));
  },

  getStoredSession(id?: string): StoredSession {
    if (!id) return { files: [], messages: [] };

    const sessionRaw = safeGetItem(`${SESSION_PREFIX}${id}`);
    if (sessionRaw) {
      try {
        const parsed = JSON.parse(sessionRaw);
        return {
          files: Array.isArray(parsed.files) ? parsed.files : [],
          messages: Array.isArray(parsed.messages) ? parsed.messages : [],
        };
      } catch {
        // Fall back to legacy if corrupted
      }
    }

    const legacyMessagesRaw = safeGetItem(`${LEGACY_MESSAGES_PREFIX}${id}`);
    const legacyFilesRaw = safeGetItem(`${LEGACY_FILES_PREFIX}${id}`);

    if (legacyMessagesRaw || legacyFilesRaw) {
      let messages: Message[] = [];
      let files: UploadedFile[] = [];

      try {
        if (legacyMessagesRaw) messages = JSON.parse(legacyMessagesRaw);
      } catch {}

      try {
        if (legacyFilesRaw) files = JSON.parse(legacyFilesRaw);
      } catch {}

      const session: StoredSession = { files, messages };
      safeSetItem(`${SESSION_PREFIX}${id}`, JSON.stringify(session));
      safeRemoveItem(`${LEGACY_MESSAGES_PREFIX}${id}`);
      safeRemoveItem(`${LEGACY_FILES_PREFIX}${id}`);
      return session;
    }

    return { files: [], messages: [] };
  },

  saveStoredSession(id: string, partial: Partial<StoredSession>): void {
    if (!id) return;
    const current = this.getStoredSession(id);
    const updated: StoredSession = {
      files: partial.files ?? current.files,
      messages: partial.messages ?? current.messages,
    };
    safeSetItem(`${SESSION_PREFIX}${id}`, JSON.stringify(updated));
  },

  getStoredMessages(id?: string): Message[] {
    return this.getStoredSession(id).messages;
  },

  saveStoredMessages(id: string, messages: Message[]): void {
    this.saveStoredSession(id, { messages });
  },

  getStoredFiles(id?: string): UploadedFile[] {
    return this.getStoredSession(id).files;
  },

  saveStoredFiles(id: string, files: UploadedFile[]): void {
    this.saveStoredSession(id, { files });
  },

  deleteStoredSession(id: string): void {
    if (!id) return;
    safeRemoveItem(`${SESSION_PREFIX}${id}`);
    safeRemoveItem(`${LEGACY_MESSAGES_PREFIX}${id}`);
    safeRemoveItem(`${LEGACY_FILES_PREFIX}${id}`);
  },

  clearAllStoredSessions(): void {
    if (!isClient()) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith(SESSION_PREFIX) ||
            key.startsWith(LEGACY_MESSAGES_PREFIX) ||
            key.startsWith(LEGACY_FILES_PREFIX) ||
            key === CHATS_KEY)
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => safeRemoveItem(key));
    } catch (e) {
      console.error("Failed to clear sessions:", e);
    }
  },

  getStoredSettings(): ArkivSettings {
    const raw = safeGetItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(raw);
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
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveStoredSettings(settings: ArkivSettings): void {
    safeSetItem(SETTINGS_KEY, JSON.stringify(settings));
  },
};
