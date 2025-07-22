import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isEmpty(data: unknown) {
  if (data == null || data == undefined || data == "") return true;
  return false;
}
