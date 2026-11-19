import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" }).format(new Date(value)) : "아직 저장하지 않았어요"; }
export function phoneHref(phone: string) { return `tel:${phone.replace(/[^\d+]/g, "")}`; }
