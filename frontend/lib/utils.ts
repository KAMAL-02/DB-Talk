import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import Image from "next/image";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

export const saveAccessToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", token);
};

export const logout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  window.location.href = "/signin";
};

export const notifySuccess = (title: string, desc?: string) =>
  toast.success(title, { description: desc });

export const notifyError = (error: any, title: string) => {
  toast.error(title, {
    description:
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Please try again.",
  });
};
