import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BusinessTemplate } from "@/components/business-template";
import { mediaUrl } from "@/lib/media";
import { SITE_ORIGIN } from "@/lib/brand";
import { getPublicSite } from "@/lib/server/sites";
export const dynamic = "force-dynamic";
const readSite = cache(getPublicSite);
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const site = await readSite(slug);
  if (!site) return { title: "페이지를 찾을 수 없어요", robots: { index: false, follow: false } };
  const c = site.content; const url = `${SITE_ORIGIN}/${slug}`;
  return { title: { absolute: c.name }, description: c.tagline, alternates: { canonical: url }, openGraph: { type: "website", locale: "ko_KR", title: c.name, description: c.tagline, url, images: c.hero ? [{ url: `${SITE_ORIGIN}${mediaUrl(site.ownerId, c.hero)}`, width: c.hero.width, height: c.hero.height, alt: `${c.name} 대표 사진` }] : [] } };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const site = await readSite(slug); if (!site) notFound();
  return <div id="main"><BusinessTemplate content={site.content} ownerId={site.ownerId} slug={slug} /></div>;
}
