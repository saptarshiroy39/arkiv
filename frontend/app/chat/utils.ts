import {
  IconPdf,
  IconCsv,
  IconTxt,
  IconMarkdown,
  IconJson,
  IconTex,
  IconFileTypeDoc,
  IconFileTypeXls,
  IconFileTypePpt,
  IconFileText,
} from "@tabler/icons-react";
import type { ComponentType, SVGAttributes } from "react";

export type IconComponent = ComponentType<
  SVGAttributes<SVGElement> & { size?: number; className?: string }
>;

export const getFileIcon = (fileName: string): IconComponent => {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "pdf":
      return IconPdf;
    case "csv":
      return IconCsv;
    case "txt":
      return IconTxt;
    case "md":
    case "mdx":
      return IconMarkdown;
    case "json":
      return IconJson;
    case "tex":
      return IconTex;
    case "docx":
    case "doc":
      return IconFileTypeDoc;
    case "xlsx":
    case "xls":
      return IconFileTypeXls;
    case "pptx":
    case "ppt":
      return IconFileTypePpt;
    default:
      return IconFileText;
  }
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const truncateFileName = (name: string, maxLength = 24) => {
  if (name.length <= maxLength) return name;
  const extensionIndex = name.lastIndexOf(".");
  const extension = extensionIndex !== -1 ? name.substring(extensionIndex) : "";
  const nameWithoutExtension =
    extensionIndex !== -1 ? name.substring(0, extensionIndex) : name;

  const charsToShow = maxLength - extension.length - 3; // 3 for "..."
  if (charsToShow <= 0) return name;

  const frontChars = Math.ceil(charsToShow * 0.7);
  const backChars = Math.floor(charsToShow * 0.3);

  return (
    nameWithoutExtension.substring(0, frontChars) +
    "..." +
    nameWithoutExtension.substring(nameWithoutExtension.length - backChars) +
    extension
  );
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_FILE_COUNT = 6;

export const getUserId = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("arc_user_id");
};

export const formatChatTitle = (timestampStr: string) => {
  const timestamp = parseInt(timestampStr);
  if (isNaN(timestamp)) return "New Analysis";
  const date = new Date(timestamp);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `Analysis ${hh}:${mm}:${ss}`;
};
