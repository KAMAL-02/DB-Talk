"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-green-600 dark:text-green-400" />
        ),
        info: <InfoIcon className="size-4 text-blue-600 dark:text-blue-400" />,
        warning: (
          <TriangleAlertIcon className="size-4 text-yellow-600 dark:text-yellow-400" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-red-600 dark:text-red-400" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-zinc-700 dark:text-zinc-300" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "bg-zinc-900 text-zinc-100 border border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
          description: "text-zinc-300",
          actionButton: "bg-zinc-800 text-zinc-100",
          cancelButton: "bg-zinc-700 text-zinc-100",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
