"use client";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
export function BrandLogo() { return <Link href="/" className="brand" aria-label={`${BRAND.name} 메인`}>{BRAND.logoText}<span className="brand-beta">BETA</span></Link>; }
export function SiteHeader() {
  const { user, loading } = useAuth();
  return <header className="site-header"><div className="shell header-inner"><BrandLogo /><nav aria-label="주요 메뉴"><Link className="browse-link" href="/#examples">업종별 예시</Link><Link className="browse-link" href="/#how-it-works">만드는 방법</Link>{user ? <><Link className="inbox-header-link" href="/dashboard/inquiries">문의함</Link><Button asChild size="sm"><Link href="/dashboard">내 홈페이지 관리</Link></Button></> : <><Link className="login-link" href="/login">로그인</Link><Button asChild size="sm"><Link href="/signup">{loading ? "시작하기" : "홈페이지 만들기"}</Link></Button></>}</nav></div></header>;
}
