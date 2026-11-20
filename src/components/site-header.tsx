"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import "./site-header.css";
export function BrandLogo() { return <Link href="/" className="brand" aria-label={`${BRAND.name} 메인`}>{BRAND.logoText}<span className="brand-beta">BETA</span></Link>; }
export function SiteHeader() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const marketingPage = pathname === "/" || pathname === "/use-cases";
  return <header className={`site-header ${marketingPage ? "has-marketing-tabs" : ""}`}><div className="shell header-inner"><BrandLogo /><nav aria-label="주요 메뉴"><Link className="browse-link" href="/#examples">홈페이지 예시</Link><Link className="browse-link use-case-nav-link" href="/use-cases" aria-current={pathname === "/use-cases" ? "page" : undefined}>사용예시</Link><Link className="browse-link" href="/#how-it-works">만드는 방법</Link>{user ? <><Link className="inbox-header-link" href="/dashboard/inquiries">문의함</Link><Button asChild size="sm"><Link href="/dashboard">내 홈페이지 관리</Link></Button></> : <><Link className="login-link" href="/login">로그인</Link><Button asChild size="sm"><Link href="/signup">{loading ? "시작하기" : "홈페이지 만들기"}</Link></Button></>}</nav></div>{marketingPage && <nav className="marketing-mobile-nav" aria-label="홈페이지 소개 메뉴"><Link href="/" aria-current={pathname === "/" ? "page" : undefined}>홈페이지 소개</Link><Link href="/use-cases" aria-current={pathname === "/use-cases" ? "page" : undefined}>사용예시</Link></nav>}</header>;
}
