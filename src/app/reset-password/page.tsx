import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "비밀번호 재설정", robots: { index: false, follow: false } };
export default function Page() { return <AuthForm mode="reset" />; }
