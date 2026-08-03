import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Draft",
    published: "Published",
    archived: "Archived",
    scheduled: "Scheduled",
  };
  return map[status] ?? status;
}

export function devStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: "Active",
    maintained: "Maintained",
    experimental: "Experimental",
    deprecated: "Deprecated",
    completed: "Completed",
    wip: "In Progress",
  };
  return map[status] ?? status;
}

export function devStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    maintained: "bg-blue-100 text-blue-800",
    experimental: "bg-yellow-100 text-yellow-800",
    deprecated: "bg-gray-100 text-gray-600",
    completed: "bg-indigo-100 text-indigo-800",
    wip: "bg-orange-100 text-orange-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}
