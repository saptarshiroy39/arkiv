export type ViewState = "upload" | "files" | "chat";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "working" | "done" | "error";
  elapsed?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  date?: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  file?: File;
}
