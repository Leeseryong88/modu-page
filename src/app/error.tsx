"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="main" className="state-panel" role="alert"><h1>페이지를 불러오지 못했어요.</h1><p>잠시 후 다시 시도해주세요.</p><Button onClick={reset}>다시 시도</Button></main>; }
