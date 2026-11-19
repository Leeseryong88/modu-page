"use client";
import Link from "next/link";
import "./inquiries.css";
import { usePathname } from "next/navigation";
import { Inbox, PanelsTopLeft } from "lucide-react";
export function DashboardNav() {
  const path = usePathname();
  return <nav className="dashboard-nav" aria-label="관리 메뉴"><Link href="/dashboard" aria-current={path === "/dashboard" ? "page" : undefined}><PanelsTopLeft size={18} />홈페이지 관리</Link><Link href="/dashboard/inquiries" aria-current={path.startsWith("/dashboard/inquiries") ? "page" : undefined}><Inbox size={18} />문의함</Link></nav>;
}
