"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { SiteRecord } from "@/lib/schema";
export function useSite() {
  const [site, setSite] = useState<SiteRecord | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const fetchSite = useCallback(async () => {
    try { setSite(await api<SiteRecord>("/api/site")); } catch (e) { setError(e instanceof Error ? e.message : "홈페이지를 불러오지 못했어요."); } finally { setLoading(false); }
  }, []);
  const reload = useCallback(async () => { setLoading(true); setError(""); await fetchSite(); }, [fetchSite]);
  useEffect(() => {
    let active = true;
    api<SiteRecord>("/api/site").then(value => { if (active) setSite(value); }).catch(e => { if (active) setError(e instanceof Error ? e.message : "홈페이지를 불러오지 못했어요."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { site, setSite, loading, error, reload };
}
