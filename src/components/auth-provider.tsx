"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { firebaseClient, firebaseConfigured } from "@/lib/firebase-client";
import { authReturnPath } from "@/lib/start-path";
import { Button } from "./ui/button";
type AuthState = { user: User | null; loading: boolean; error: string; logout: () => Promise<void> };
const AuthContext = createContext<AuthState>({ user: null, loading: true, error: "", logout: async () => {} });
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, "logout">>({ user: null, loading: firebaseConfigured, error: "" });
  useEffect(() => {
    if (!firebaseConfigured) return;
    let generation = 0;
    return onIdTokenChanged(firebaseClient().auth, async user => {
      const current = ++generation;
      if (!user) { setState({ user: null, loading: false, error: "" }); return; }
      setState(previous => previous.user?.uid === user.uid ? previous : { user: null, loading: true, error: "" });
      try {
        const response = await fetch("/api/session", { method: "POST", headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        if (!response.ok) throw new Error((await response.json()).error);
        if (current === generation) setState({ user, loading: false, error: "" });
      } catch (e) { if (current === generation) setState({ user: null, loading: false, error: e instanceof Error ? e.message : "로그인을 확인하지 못했어요." }); }
    });
  }, []);
  async function logout() {
    const res = await fetch("/api/session", { method: "DELETE" });
    if (!res.ok) throw new Error("로그아웃하지 못했어요. 다시 시도해주세요.");
    await signOut(firebaseClient().auth);
  }
  return <AuthContext.Provider value={{ ...state, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth(); const router = useRouter();
  useEffect(() => { if (firebaseConfigured && !loading && !user && !error) router.replace(`/login?next=${encodeURIComponent(authReturnPath(window.location.pathname + window.location.search))}`); }, [user, loading, error, router]);
  if (!firebaseConfigured) return <div className="state-panel"><h1>서비스 연결을 준비하고 있어요.</h1><p>현재는 회원가입과 홈페이지 저장을 이용할 수 없어요. 관리자에게 문의해주세요.</p><Button asChild variant="outline"><Link href="/">메인으로 돌아가기</Link></Button></div>;
  if (error) return <div className="state-panel" role="alert"><h1>로그인을 확인하지 못했어요.</h1><p>{error}</p><Button onClick={() => location.reload()}>다시 시도</Button></div>;
  if (loading || !user) return <div className="state-panel" role="status" aria-busy="true"><span className="spinner" />로그인을 확인하고 있어요.</div>;
  return children;
}
