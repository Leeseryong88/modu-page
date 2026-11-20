import { AuthForm } from "@/components/auth-form";
import { authReturnPath } from "@/lib/start-path";
export const metadata = { title: "로그인", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  return <AuthForm mode="login" next={authReturnPath((await searchParams).next)} />;
}
