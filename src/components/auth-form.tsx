"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { authMessage, firebaseClient, firebaseConfigured } from "@/lib/firebase-client";
import { BRAND } from "@/lib/brand";
import { useAuth } from "./auth-provider";
import { BrandLogo } from "./site-header";
import { Button } from "./ui/button";
export function AuthForm({ mode }: { mode: "signup" | "login" | "reset" }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [sent, setSent] = useState(false);
  const { user, error: sessionError } = useAuth(); const router = useRouter();
  useEffect(() => { if (user && mode !== "reset") router.replace("/dashboard"); }, [user, mode, router]);
  const titles = { signup: "우리 업체를 알리는\n첫걸음, 함께 시작해요.", login: "반가워요.\n홈페이지를 이어서 만들어볼까요?", reset: "비밀번호를\n다시 설정할 수 있어요." };
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (mode === "signup" && password !== confirm) { setError("비밀번호가 서로 달라요. 다시 확인해주세요."); return; }
    setBusy(true);
    try {
      const { auth } = firebaseClient();
      if (mode === "signup") await createUserWithEmailAndPassword(auth, email.trim(), password);
      else if (mode === "login") await signInWithEmailAndPassword(auth, email.trim(), password);
      else { await sendPasswordResetEmail(auth, email.trim()); setSent(true); }
    } catch (e) { setError(authMessage(e)); } finally { setBusy(false); }
  }
  return <div className="auth-page"><div className="auth-brand"><BrandLogo /></div><main id="main" className="auth-layout"><aside className="auth-aside"><span className="eyebrow">작은 시작, 우리만의 홈페이지</span><h1>{titles[mode]}</h1><p>잘해온 작업과 정성껏 쌓은 경험.<br />이제 한 페이지에서 보여주세요.</p><div className="auth-notes"><p><CheckCircle2 size={19} />사진과 정보만으로 만드는 홈페이지</p><p><CheckCircle2 size={19} />원하는 때에 저장하고 이어서 작성</p><p><CheckCircle2 size={19} />확인한 후, 내 주소로 직접 공개</p></div><span className="auth-aside-foot">나의 일을, 나답게 소개하는 곳. {BRAND.name}</span></aside><section className="auth-card"><span className="auth-icon"><LockKeyhole size={23} /></span><h2>{mode === "signup" ? "이메일로 시작하기" : mode === "login" ? "로그인" : "비밀번호 재설정"}</h2><p className="muted">{mode === "signup" ? "한 계정으로 홈페이지 하나를 만들 수 있어요." : mode === "login" ? "가입할 때 사용한 이메일을 입력해주세요." : "가입한 이메일로 재설정 안내를 보내드려요."}</p>
    {!firebaseConfigured && <div className="notice" role="alert">서비스 연결을 준비 중이에요. 현재 회원가입과 로그인을 이용할 수 없어요.</div>}
    {sent ? <div className="success-panel" role="status"><CheckCircle2 /><h3>이메일을 확인해주세요.</h3><p>가입된 이메일이라면 비밀번호 재설정 안내가 전송돼요. 메일이 보이지 않으면 스팸함도 확인해주세요.</p><Button asChild><Link href="/login">로그인으로 돌아가기</Link></Button></div> : <form onSubmit={submit}><div className="field"><label htmlFor="email">이메일</label><input id="email" type="email" autoComplete="email" placeholder="예: hello@example.com" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></div>
    {mode !== "reset" && <div className="field"><label htmlFor="password">비밀번호</label><div className="password-input"><input id="password" type={visible ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : undefined} maxLength={128} required placeholder={mode === "signup" ? "8자 이상 입력해주세요" : "비밀번호를 입력해주세요"} value={password} onChange={e => setPassword(e.target.value)} /><button type="button" className="button-icon" aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></div>}
    {mode === "signup" && <div className="field"><label htmlFor="confirm">비밀번호 확인</label><input id="confirm" type={visible ? "text" : "password"} autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="비밀번호를 한 번 더 입력해주세요" /></div>}
    {(error || sessionError) && <p className="field-error" role="alert">{error || sessionError}</p>}
    <Button className="full-width" type="submit" disabled={busy || !firebaseConfigured}>{busy ? "처리하고 있어요…" : mode === "signup" ? "가입하고 홈페이지 만들기" : mode === "login" ? "로그인" : "재설정 이메일 받기"}</Button>
    {mode === "login" && <Link href="/reset-password" className="reset-link">비밀번호를 잊으셨나요?</Link>}</form>}
    <p className="auth-switch">{mode === "signup" ? <>이미 계정이 있나요? <Link href="/login">로그인</Link></> : mode === "login" ? <>처음 방문하셨나요? <Link href="/signup">회원가입</Link></> : <Link href="/login">로그인으로 돌아가기</Link>}</p></section></main></div>;
}
