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
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatDateNoYear = (date: Date) =>
  `${months[date.getMonth()]} ${date.getDate()}`;

export const getOrderSuffix = (number: number) => {
  if (number % 1 !== 0) return;

  if (number >= 11 && number <= 13) return "th";
  if ((number - 1) % 10 === 0) return "st";
  if ((number - 2) % 10 === 0) return "nd";
  if ((number - 3) % 10 === 0) return "rd";
  return "th";
};

export const formatFullDate = (date: Date) =>
  `${months[date.getMonth()]} ${date.getDate()}${getOrderSuffix(date.getDate())} ${date.getFullYear()}`;

export const formatNumericalDate = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
