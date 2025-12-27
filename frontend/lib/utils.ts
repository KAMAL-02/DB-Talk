import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

export const notifySuccess = (title: string, desc?: string) =>
  toast.success(title, { description: desc })

export const notifyError = (error: any, title: string) => {
  toast.error(title, {
    description:
      error?.data?.error ||
      error?.message ||
      "Please try again.",
  })
}

