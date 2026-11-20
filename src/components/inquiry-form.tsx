"use client";
import { useId, useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { INQUIRY_KINDS, inquiryInputSchema, type InquiryInput } from "@/lib/inquiries";
import "./inquiries.css";

const EMPTY_FORM = { name: "", phone: "", kind: "일반 문의" as InquiryInput["kind"], region: "", message: "", consent: false, website: "" };
export function InquiryForm({ siteName, slug, mode = "public", anchorId = "inquiry" }: { siteName: string; slug?: string; mode?: "public" | "preview" | "example"; anchorId?: string }) {
  const prefix = useId();
  const [form, setForm] = useState(EMPTY_FORM), [requestId, setRequestId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({}), [error, setError] = useState("");
  const [busy, setBusy] = useState(false), [received, setReceived] = useState(false), [demoNotice, setDemoNotice] = useState(false);
  function change<K extends keyof typeof form>(key: K, value: typeof form[K]) { setForm(previous => ({ ...previous, [key]: value })); setRequestId(""); setErrors(previous => ({ ...previous, [key]: "" })); setError(""); setDemoNotice(false); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    const id = requestId || crypto.randomUUID(); setRequestId(id);
    const parsed = inquiryInputSchema.safeParse({ ...form, requestId: id });
    if (!parsed.success) {
      const issues = Object.fromEntries(parsed.error.issues.map(issue => [issue.path.join("."), issue.message])); setErrors(issues);
      document.getElementById(`${prefix}-${String(parsed.error.issues[0].path[0])}`)?.focus(); return;
    }
    setErrors({}); setError("");
    if (mode !== "public") { setDemoNotice(true); return; }
    if (!slug) { setError("문의할 홈페이지를 확인하지 못했어요. 페이지를 새로고침해주세요."); return; }
    setBusy(true);
    try {
      const response = await fetch(`/api/public/inquiries/${encodeURIComponent(slug)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const result = await response.json();
      if (!response.ok || !result.received) throw new Error(result.error || "접수하지 못했어요. 다시 시도해주세요.");
      setReceived(true); setForm(EMPTY_FORM);
    } catch (e) { setError(e instanceof Error ? e.message : "접수하지 못했어요. 다시 시도해주세요."); }
    finally { setBusy(false); }
  }
  const fieldProps = (key: keyof typeof form) => ({ id: `${prefix}-${key}`, "aria-invalid": !!errors[key], "aria-describedby": errors[key] ? `${prefix}-${key}-error` : undefined });
  const fieldError = (key: keyof typeof form) => errors[key] && <p id={`${prefix}-${key}-error`} className="inquiry-field-error">{errors[key]}</p>;
  return <section id={anchorId} className="inquiry-section" aria-labelledby={`${prefix}-title`}>
    <div className="inquiry-intro"><p className="section-kicker">INQUIRY</p><h3 id={`${prefix}-title`}>함께 나누고 싶은 이야기,<br />여기에 남겨주세요.</h3><p>내용을 확인한 뒤 남겨주신 연락처로 답변드릴게요.</p>{mode !== "public" && <p className="inquiry-demo-label">{mode === "example" ? "예시 양식 · 실제 문의는 전송되지 않아요." : "편집 미리보기 · 문의는 전송되지 않아요."}</p>}</div>
    {received ? <div className="inquiry-received" role="status"><CheckCircle2 size={28} /><h4>문의가 접수됐어요.</h4><p>{siteName}에서 내용을 확인한 뒤 연락드릴 예정이에요.</p><button type="button" className="business-button secondary" onClick={() => { setReceived(false); setRequestId(""); }}>새 문의 작성</button></div> : <form onSubmit={submit} noValidate className="inquiry-form">
      <fieldset disabled={busy}>
        <div className="inquiry-field-row"><div><label htmlFor={`${prefix}-name`}>성함 <span>필수</span></label><input {...fieldProps("name")} value={form.name} onChange={e => change("name", e.target.value)} maxLength={40} autoComplete="name" placeholder="성함을 적어주세요" />{fieldError("name")}</div><div><label htmlFor={`${prefix}-phone`}>연락처 <span>필수</span></label><input {...fieldProps("phone")} type="tel" value={form.phone} onChange={e => change("phone", e.target.value)} maxLength={24} autoComplete="tel" placeholder="010-0000-0000" />{fieldError("phone")}</div></div>
        <div className="inquiry-field-row"><div><label htmlFor={`${prefix}-kind`}>문의 종류</label><select {...fieldProps("kind")} value={form.kind} onChange={e => change("kind", e.target.value as InquiryInput["kind"])}>{INQUIRY_KINDS.map(kind => <option key={kind}>{kind}</option>)}</select></div><div><label htmlFor={`${prefix}-region`}>지역 <span className="inquiry-optional">선택</span></label><input {...fieldProps("region")} value={form.region} onChange={e => change("region", e.target.value)} maxLength={80} placeholder="예: 수원 영통구" />{fieldError("region")}</div></div>
        <div><label htmlFor={`${prefix}-message`}>문의 내용 <span>필수</span></label><textarea {...fieldProps("message")} rows={5} value={form.message} onChange={e => change("message", e.target.value)} maxLength={2000} placeholder="함께하고 싶은 일, 원하시는 일정, 궁금한 점을 10자 이상 적어주세요." /><p className="inquiry-length">{form.message.length} / 2,000자</p>{fieldError("message")}</div>
        <div className="inquiry-honeypot" aria-hidden="true"><label htmlFor={`${prefix}-website`}>Website</label><input id={`${prefix}-website`} name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => change("website", e.target.value)} /></div>
        <p className="inquiry-privacy">문의 확인과 답변을 위해 이름·연락처·문의 내용을 {siteName || "홈페이지 운영자"}에 전달합니다. 입력한 내용은 공개되지 않습니다.</p>
        <label className="inquiry-consent" htmlFor={`${prefix}-consent`}><input {...fieldProps("consent")} type="checkbox" checked={form.consent} onChange={e => change("consent", e.target.checked)} /><span>문의 답변을 위한 정보 제공에 동의합니다. (필수)</span></label>{fieldError("consent")}
        {error && <p className="inquiry-field-error" role="alert">{error} 입력한 내용은 유지되어 있어요.</p>}
        {demoNotice && <p className="inquiry-demo-notice" role="status">양식 체험을 완료했어요. 실제 문의는 전송하지 않았습니다. 공개한 홈페이지에서는 접수 내용이 홈페이지 운영자의 문의함에 저장돼요.</p>}
        <button type="submit" className="business-button inquiry-submit" disabled={busy}><Send size={17} />{busy ? "접수하고 있어요…" : mode === "public" ? "문의 보내기" : "문의 양식 체험하기"}</button>
      </fieldset>
    </form>}
  </section>;
}
