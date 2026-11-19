import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "로그인", robots: { index: false, follow: false } };
export default function Page() { return <AuthForm mode="login" />; }
