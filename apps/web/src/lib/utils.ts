import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Arp",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatPostDate = (date: Date) =>
  `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
