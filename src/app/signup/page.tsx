import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "회원가입", robots: { index: false, follow: false } };
export default function Page() { return <AuthForm mode="signup" />; }
