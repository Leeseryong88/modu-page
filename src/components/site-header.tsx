"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import "./site-header.css";
export function BrandLogo() { return <Link href="/" className="brand" aria-label={`${BRAND.name} 메인`}>{BRAND.logoText}<span className="brand-beta">BETA</span></Link>; }
export function SiteHeader() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const marketingPage = pathname === "/";
  const [activeSection, setActiveSection] = useState("");
  useEffect(() => {
    const update = () => setActiveSection(window.location.hash || "#intro");
    update(); window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);
  return <header className={`site-header ${marketingPage ? "has-marketing-tabs" : ""}`}><div className="shell header-inner"><BrandLogo /><nav aria-label="주요 메뉴">{marketingPage ? <><a className="browse-link" href="#examples" aria-current={activeSection === "#examples" ? "location" : undefined}>홈페이지 예시</a><a className="browse-link" href="#how-it-works" aria-current={activeSection === "#how-it-works" ? "location" : undefined}>만드는 방법</a></> : <><Link className="browse-link" href="/#examples">홈페이지 예시</Link><Link className="browse-link" href="/#how-it-works">만드는 방법</Link></>}{user ? <><Link className="inbox-header-link" href="/dashboard/inquiries">문의함</Link><Button asChild size="sm"><Link href="/dashboard">내 홈페이지 관리</Link></Button></> : <><Link className="login-link" href="/login">로그인</Link><Button asChild size="sm"><Link href="/signup?next=%2Fdashboard%2Feditor">{loading ? "시작하기" : "홈페이지 만들기"}</Link></Button></>}</nav></div>{marketingPage && <nav className="marketing-mobile-nav" aria-label="홈페이지 소개 메뉴"><a href="#intro" aria-current={activeSection === "#intro" ? "location" : undefined}>홈페이지 소개</a><a href="#examples" aria-current={activeSection === "#examples" ? "location" : undefined}>예시·활용법</a><a href="#how-it-works" aria-current={activeSection === "#how-it-works" ? "location" : undefined}>만드는 방법</a></nav>}</header>;
}
