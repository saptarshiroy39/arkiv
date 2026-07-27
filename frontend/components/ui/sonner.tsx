"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  IconCircleCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertSquare,
  IconLoader,
} from "@tabler/icons-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <IconCircleCheck className="size-4" />,
        info: <IconInfoCircle className="size-4" />,
        warning: <IconAlertTriangle className="size-4" />,
        error: <IconAlertSquare className="size-4" />,
        loading: <IconLoader className="size-4 animate-spin" />,
      }}
      style={
        {
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-data-[theme=light]:bg-background group-data-[theme=light]:text-foreground group-data-[theme=light]:border-border group-data-[theme=dark]:bg-background group-data-[theme=dark]:text-foreground group-data-[theme=dark]:border-border font-mono rounded-none shadow-lg border p-4 flex gap-3 items-center",
          error:
            "group-[.toast]:bg-red-500/10 group-[.toast]:text-red-500 group-[.toast]:border-red-500/20 dark:group-[.toast]:bg-red-500/15 dark:group-[.toast]:text-red-400 dark:group-[.toast]:border-red-500/20",
          success:
            "group-[.toast]:bg-emerald-500/10 group-[.toast]:text-emerald-500 group-[.toast]:border-emerald-500/20 dark:group-[.toast]:bg-emerald-500/15 dark:group-[.toast]:text-emerald-400 dark:group-[.toast]:border-emerald-500/20",
          warning:
            "group-[.toast]:bg-amber-500/10 group-[.toast]:text-amber-500 group-[.toast]:border-amber-500/20 dark:group-[.toast]:bg-amber-500/15 dark:group-[.toast]:text-amber-400 dark:group-[.toast]:border-amber-500/20",
          info: "group-[.toast]:bg-blue-500/10 group-[.toast]:text-blue-500 group-[.toast]:border-blue-500/20 dark:group-[.toast]:bg-blue-500/15 dark:group-[.toast]:text-blue-400 dark:group-[.toast]:border-blue-500/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
