import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EXAMPLES, getExample } from "@/lib/examples";
import { ExampleSite } from "@/components/example-site";

export function generateStaticParams() { return EXAMPLES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const example = getExample((await params).slug);
  return { title: example ? `${example.category} 홈페이지 예시 — ${example.content.name}` : "홈페이지 예시", description: example?.summary, robots: { index: false, follow: true } };
}
export default async function ExamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const example = getExample((await params).slug);
  if (!example) notFound();
  return <ExampleSite example={example} />;
}
