import { AuthForm } from "@/components/auth-form";
import { authReturnPath } from "@/lib/start-path";
export const metadata = { title: "회원가입", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  return <AuthForm mode="signup" next={authReturnPath((await searchParams).next)} />;
}
