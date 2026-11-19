"use client";
import { useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { firebaseClient } from "@/lib/firebase-client";
import { prepareImage } from "@/lib/image-client";
import type { SiteImage } from "@/lib/schema";
import { Button } from "./ui/button";
import { mediaUrl } from "./business-template";
export function ImageUpload({ label, value, ownerId, onChange, onBusy, position = "center", logo = false, error: fieldError, inputId }: { label: string; value: SiteImage | null; ownerId: string; onChange: (image: SiteImage | null) => void; onBusy: (delta: number) => void; position?: string; logo?: boolean; error?: string; inputId: string }) {
  const [progress, setProgress] = useState<number | null>(null); const [error, setError] = useState(""); const [retry, setRetry] = useState<File | null>(null); const input = useRef<HTMLInputElement>(null);
  async function upload(file: File) {
    setRetry(file); setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0) { setError("5MB 이하의 JPG, PNG, WebP 사진을 선택해주세요."); setRetry(null); return; }
    setProgress(0); onBusy(1);
    try {
      const prepared = await prepareImage(file);
      const token = await firebaseClient().auth.currentUser?.getIdToken();
      if (!token) throw new Error("로그인을 다시 확인해주세요.");
      const image = await new Promise<SiteImage>((resolve, reject) => {
        const xhr = new XMLHttpRequest(); xhr.open("POST", "/api/media/upload");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`); xhr.setRequestHeader("Content-Type", prepared.type); xhr.setRequestHeader("X-Image-Id", crypto.randomUUID());
        xhr.timeout = 90000;
        xhr.upload.onprogress = event => { if (event.lengthComputable) setProgress(Math.min(99, Math.round(event.loaded / event.total * 100))); };
        xhr.onerror = () => reject(new Error("인터넷 연결을 확인한 뒤 다시 시도해주세요."));
        xhr.ontimeout = () => reject(new Error("사진 등록 시간이 초과됐어요. 다시 시도해주세요."));
        xhr.onload = () => { try { const result = JSON.parse(xhr.responseText); if (xhr.status >= 200 && xhr.status < 300) resolve(result); else reject(new Error(result.error || "사진을 등록하지 못했어요.")); } catch { reject(new Error("사진을 등록하지 못했어요. 다시 시도해주세요.")); } };
        xhr.send(prepared);
      });
      onChange(image); setRetry(null);
    } catch (e) { setError(e instanceof Error && !e.message.startsWith("Firebase") ? e.message : "사진을 등록하지 못했어요. 인터넷 연결을 확인한 뒤 다시 시도해주세요."); }
    finally { setProgress(null); onBusy(-1); if (input.current) input.current.value = ""; }
  }
  return <div className="image-upload"><div className={`upload-preview ${logo ? "logo-preview" : ""}`}>{value ? <img src={mediaUrl(ownerId, value)} alt={`${label} 미리보기`} style={{ objectPosition: position }} width={value.width} height={value.height} /> : <div><ImagePlus size={28} strokeWidth={1.4} /><p>{label}를 등록해주세요.</p><span>JPG, PNG, WebP · 최대 5MB</span></div>}</div><input ref={input} className="sr-only" id={`${inputId}-file`} type="file" accept="image/jpeg,image/png,image/webp" disabled={progress !== null} aria-label={`${label} 선택`} onChange={e => { const file = e.target.files?.[0]; if (file) void upload(file); }} /><div className="upload-actions"><Button id={inputId} type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={progress !== null}>{value ? "사진 교체" : "사진 선택"}</Button>{value && <Button type="button" variant="ghost" size="sm" onClick={() => { if (window.confirm(`${label}를 초안에서 삭제할까요? 공개 중인 사진은 공개 내용을 업데이트할 때까지 유지돼요.`)) onChange(null); }} disabled={progress !== null}><Trash2 size={15} />삭제</Button>}</div>{progress !== null && <div role="status"><progress max={100} value={progress} /><p className="field-hint">{progress >= 99 ? "사진을 확인하고 있어요…" : `사진을 올리고 있어요… ${progress}%`}</p></div>}{(error || fieldError) && <p className="field-error" role="alert">{error || fieldError}</p>}{error && retry && <Button type="button" variant="outline" size="sm" onClick={() => void upload(retry!)} disabled={progress !== null}><RefreshCw size={14} />다시 시도</Button>}</div>;
}
