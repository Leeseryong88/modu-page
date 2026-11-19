import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
export default function NotFound() { return <><SiteHeader /><main id="main" className="state-panel"><span className="eyebrow">404 · 페이지를 찾을 수 없어요</span><h1>아직 공개되지 않았거나<br />존재하지 않는 홈페이지예요.</h1><p>주소를 다시 확인해주세요.</p><Button asChild><Link href="/">메인으로 돌아가기</Link></Button></main></>; }
