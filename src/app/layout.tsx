import type { Metadata } from "next";
import { BRAND, SITE_ORIGIN } from "@/lib/brand";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";
import "@fontsource-variable/noto-sans-kr";
export const metadata: Metadata = { metadataBase: new URL(SITE_ORIGIN), title: { default: `${BRAND.name} — 내 이야기가 시작되는 홈페이지`, template: `%s | ${BRAND.name}` }, description: BRAND.description };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="ko" data-scroll-behavior="smooth"><body><a href="#main" className="skip-link">본문으로 건너뛰기</a><AuthProvider>{children}</AuthProvider></body></html>; }
