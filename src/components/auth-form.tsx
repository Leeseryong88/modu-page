"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { authMessage, firebaseConfigured, signInWithGoogle } from "@/lib/firebase-client";
import { BRAND } from "@/lib/brand";
import { useAuth } from "./auth-provider";
import { BrandLogo } from "./site-header";
import { Button } from "./ui/button";
import "./google-auth.css";
export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const pending = useRef(false);
  const { user, loading, error: sessionError } = useAuth(); const router = useRouter();
  useEffect(() => { if (user) router.replace("/dashboard"); }, [user, router]);
  async function submit() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError("");
    try { await signInWithGoogle(); }
    catch (e) { setError(authMessage(e)); }
    finally { pending.current = false; setBusy(false); }
  }
  return <div className="auth-page"><div className="auth-brand"><BrandLogo /></div><main id="main" className="auth-layout"><aside className="auth-aside"><span className="eyebrow">작은 시작, 우리만의 홈페이지</span><h1>{mode === "signup" ? "우리 업체를 알리는\n첫걸음, 함께 시작해요." : "반가워요.\n홈페이지를 이어서 만들어볼까요?"}</h1><p>잘해온 작업과 정성껏 쌓은 경험.<br />이제 한 페이지에서 보여주세요.</p><div className="auth-notes"><p><CheckCircle2 size={19} />사진과 정보만으로 만드는 홈페이지</p><p><CheckCircle2 size={19} />원하는 때에 저장하고 이어서 작성</p><p><CheckCircle2 size={19} />확인한 후, 내 주소로 직접 공개</p></div><span className="auth-aside-foot">나의 일을, 나답게 소개하는 곳. {BRAND.name}</span></aside><section className="auth-card"><span className="auth-icon"><LockKeyhole size={23} /></span><h2>{mode === "signup" ? "구글 계정으로 시작하기" : "구글 계정으로 로그인"}</h2><p className="muted">{mode === "signup" ? "별도의 아이디와 비밀번호 없이 시작하세요." : "홈페이지를 만들 때 사용한 구글 계정을 선택해주세요."}</p>
    {!firebaseConfigured && <div className="notice" role="alert">서비스 연결을 준비 중이에요. 현재 구글 로그인을 이용할 수 없어요.</div>}
    <Button className="full-width google-auth-button" variant="outline" type="button" onClick={() => void submit()} disabled={busy || loading || !!user || !firebaseConfigured}><GoogleMark />{busy ? "구글 계정을 확인하고 있어요…" : loading || user ? "로그인을 확인하고 있어요…" : mode === "signup" ? "Google로 가입하기" : "Google로 로그인"}</Button>
    <p className="google-auth-help">처음 방문하셨다면 구글 로그인과 함께 계정이 만들어져요.<br />이미 가입했다면 기존 홈페이지를 이어서 관리할 수 있어요.</p>
    {(error || sessionError) && <p className="field-error" role="alert">{error || sessionError}</p>}
    {sessionError && <Button variant="outline" className="full-width" onClick={() => location.reload()}>로그인 연결 다시 확인</Button>}
    <p className="auth-switch">{mode === "signup" ? <>이미 계정이 있나요? <Link href="/login">로그인</Link></> : <>처음 방문하셨나요? <Link href="/signup">구글로 시작하기</Link></>}</p></section></main></div>;
}
function GoogleMark() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.86 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.77-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>;
}
