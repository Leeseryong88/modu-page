import { Editor } from "@/components/editor";
export const metadata = { title: "홈페이지 만들기" };
export default async function Page({ searchParams }: { searchParams: Promise<{ example?: string | string[] }> }) {
  const { example } = await searchParams;
  const exampleSlug = typeof example === "string" ? example : undefined;
  return <Editor key={exampleSlug ?? "default"} exampleSlug={exampleSlug} />;
}
