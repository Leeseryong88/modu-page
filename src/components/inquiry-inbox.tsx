"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, Phone, RefreshCw, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { EMPTY_INQUIRY_STATS, INQUIRY_STATUSES, type Inquiry, type InquiryList, type InquiryStatus } from "@/lib/inquiries";
import { formatDate, phoneHref } from "@/lib/utils";
import { SiteHeader } from "./site-header";
import { DashboardNav } from "./dashboard-nav";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import "./inquiries.css";

function InquiryDetail({ inquiry, onUpdated, onDeleted, onBack, onDirtyChange, onBusyChange }: { inquiry: Inquiry; onUpdated: (next: Inquiry) => void; onDeleted: (id: string) => void; onBack: () => void; onDirtyChange: (dirty: boolean) => void; onBusyChange: (busy: boolean) => void }) {
  const [status, setStatus] = useState(inquiry.status), [note, setNote] = useState(inquiry.note);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState(""), [confirm, setConfirm] = useState(false);
  async function save() {
    setBusy(true); onBusyChange(true); setError(""); setNotice("");
    try { const next = await api<Inquiry>(`/api/inquiries/${inquiry.id}`, { method: "PATCH", body: JSON.stringify({ status, note, revision: inquiry.revision }) }); onDirtyChange(false); onUpdated(next); setNotice("상태와 메모를 저장했어요."); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); onBusyChange(false); }
  }
  async function remove() {
    setBusy(true); onBusyChange(true); setError("");
    try { await api(`/api/inquiries/${inquiry.id}`, { method: "DELETE", body: JSON.stringify({ revision: inquiry.revision }) }); setConfirm(false); onDirtyChange(false); onDeleted(inquiry.id); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); onBusyChange(false); }
  }
  const dirty = status !== inquiry.status || note !== inquiry.note;
  return <section className="inbox-detail" aria-labelledby="inquiry-detail-title"><div className="inbox-detail-top"><button className="inbox-mobile-back" onClick={onBack}>문의 목록으로</button><span className={`inquiry-badge status-${inquiry.status}`}>{INQUIRY_STATUSES[inquiry.status]}</span><button className="button button-ghost button-icon" aria-label="문의 삭제" onClick={() => setConfirm(true)} disabled={busy}><Trash2 size={18} /></button></div>
    <p className="inbox-detail-kind">{inquiry.kind} · {formatDate(inquiry.createdAt)}</p><h2 id="inquiry-detail-title">{inquiry.name}님의 문의</h2><dl className="inbox-customer"><div><dt>연락처</dt><dd><a href={phoneHref(inquiry.phone)}><Phone size={16} />{inquiry.phone}</a></dd></div>{inquiry.region && <div><dt>지역</dt><dd>{inquiry.region}</dd></div>}<div><dt>홈페이지</dt><dd>{inquiry.siteName} <span>/{inquiry.slug}</span></dd></div></dl>
    <div className="inbox-message"><h3>문의 내용</h3><p>{inquiry.message}</p></div>
    <div className="inbox-processing"><h3>문의 관리</h3><label htmlFor="inquiry-status">처리 상태</label><select id="inquiry-status" value={status} disabled={busy} onChange={e => { setStatus(e.target.value as InquiryStatus); onDirtyChange(e.target.value !== inquiry.status || note !== inquiry.note); setNotice(""); }}>{Object.entries(INQUIRY_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label htmlFor="inquiry-note">내부 메모 <span>고객에게 공개되지 않아요</span></label><textarea id="inquiry-note" value={note} disabled={busy} onChange={e => { setNote(e.target.value); onDirtyChange(status !== inquiry.status || e.target.value !== inquiry.note); setNotice(""); }} maxLength={2000} rows={4} placeholder="상담 내용이나 다음에 확인할 일을 남겨주세요." /><div className="inbox-save"><span>{dirty ? "저장되지 않은 변경사항" : `마지막 변경 ${formatDate(inquiry.updatedAt)}`}</span><Button onClick={() => void save()} disabled={busy || !dirty}>{busy ? "처리 중…" : "변경사항 저장"}</Button></div>{error && <p role="alert" className="field-error">{error}</p>}{notice && <p role="status" className="field-success">{notice}</p>}</div>
    <Dialog open={confirm} onOpenChange={value => { if (!busy) setConfirm(value); }}><DialogContent><DialogTitle>이 문의를 삭제할까요?</DialogTitle><DialogDescription>연락처와 문의 내용, 내부 메모가 영구 삭제됩니다. 집계에서도 제외되며 되돌릴 수 없어요.</DialogDescription><div className="dialog-actions"><Button variant="outline" onClick={() => setConfirm(false)} disabled={busy}>취소</Button><Button variant="destructive" onClick={() => void remove()} disabled={busy}>{busy ? "삭제 중…" : "문의 삭제"}</Button></div>{error && <p className="field-error">{error}</p>}</DialogContent></Dialog>
  </section>;
}

export function InquiryInbox() {
  const [filter, setFilter] = useState<InquiryStatus | "all">("all"), [data, setData] = useState<InquiryList>({ items: [], stats: EMPTY_INQUIRY_STATS, cursor: null });
  const [selected, setSelected] = useState<Inquiry | null>(null), [loading, setLoading] = useState(true), [more, setMore] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0), [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false);
  useEffect(() => { if (!dirty) return; const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  function mayLeave() { if (saving) return false; if (dirty && !window.confirm("저장하지 않은 상태와 메모가 있어요. 변경사항을 버리고 이동할까요?")) return false; setDirty(false); return true; }
  function selectInquiry(item: Inquiry | null) { if (item?.id === selected?.id || !mayLeave()) return; setSelected(item); setNotice(""); }
  const path = `/api/inquiries?status=${filter}`;
  useEffect(() => {
    let cancelled = false;
    api<InquiryList>(path).then(next => { if (!cancelled) { setData(next); setError(""); } }).catch(e => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [path, refresh]);
  function reload() { if (!mayLeave()) return; setLoading(true); setSelected(null); setError(""); setRefresh(value => value + 1); }
  function chooseFilter(value: InquiryStatus | "all") { if (value === filter || !mayLeave()) return; setFilter(value); setLoading(true); setSelected(null); setNotice(""); setError(""); }
  async function loadMore() {
    if (!data.cursor || more) return;
    setMore(true); setError("");
    try { const next = await api<InquiryList>(`${path}&cursor=${encodeURIComponent(data.cursor)}`); setData(previous => ({ ...next, items: [...previous.items, ...next.items.filter(item => !previous.items.some(old => old.id === item.id))] })); }
    catch (e) { setError((e as Error).message); } finally { setMore(false); }
  }
  function updated(next: Inquiry) {
    setData(previous => {
      const old = previous.items.find(item => item.id === next.id) || (selected?.id === next.id ? selected : null), stats = { ...previous.stats };
      if (old && old.status !== next.status) { stats[old.status] = Math.max(0, stats[old.status] - 1); stats[next.status] += 1; }
      return { ...previous, stats, items: previous.items.map(item => item.id === next.id ? next : item).filter(item => filter === "all" || item.status === filter) };
    });
    setSelected(next); setNotice("상태와 메모를 저장했어요.");
  }
  function deleted(id: string) {
    setData(previous => { const item = previous.items.find(item => item.id === id) || selected; const stats = { ...previous.stats, total: Math.max(0, previous.stats.total - 1) }; if (item) stats[item.status] = Math.max(0, stats[item.status] - 1); return { ...previous, stats, items: previous.items.filter(item => item.id !== id) }; });
    setSelected(null); setNotice("문의를 삭제했어요.");
  }
  return <><SiteHeader /><main id="main" className="shell inbox-page"><DashboardNav /><div className="inbox-heading"><div><p className="eyebrow">새로운 연결을 한곳에</p><h1>문의함</h1><p>홈페이지에서 접수된 문의를 확인하고 상담 상태를 관리하세요.</p></div><Button variant="outline" onClick={reload} disabled={loading || more || saving}><RefreshCw size={16} />새로고침</Button></div>
    <div className="inbox-stats" aria-label="문의 상태별 집계">{([['all', '전체 문의', data.stats.total], ['new', '새 문의', data.stats.new], ['progress', '상담 중', data.stats.progress], ['done', '완료', data.stats.done]] as const).map(([value, label, count]) => <button key={value} aria-pressed={filter === value} disabled={more || saving} onClick={() => chooseFilter(value)}><span>{label}</span><strong>{loading ? "—" : count}<small>건</small></strong></button>)}</div>
    {notice && <p className="notice" role="status">{notice}</p>}{error && <div className="notice" role="alert"><p>{error}</p><Button variant="outline" onClick={reload}>다시 불러오기</Button></div>}
    {loading ? <div className="state-panel" role="status" aria-busy="true">문의 목록을 불러오고 있어요…</div> : !error && !data.items.length && !selected ? <section className="inbox-empty"><Inbox size={36} strokeWidth={1.4} /><h2>{filter === "all" ? "아직 접수된 문의가 없어요." : `${INQUIRY_STATUSES[filter as InquiryStatus]}가 없어요.`}</h2><p>공개한 홈페이지의 문의 양식으로 접수되면 이곳에서 확인할 수 있어요.<br />문의 내용은 홈페이지를 수정하거나 비공개로 바꿔도 보관됩니다.</p><Link href="/dashboard" className="text-link">내 홈페이지 확인하기</Link></section> : <div className={`inbox-workspace ${selected ? "has-selection" : ""}`}><section className="inbox-list" aria-label="접수된 문의 목록"><div className="inbox-list-heading"><strong>{filter === "all" ? "모든 문의" : INQUIRY_STATUSES[filter]}</strong><span>최근 접수순</span></div>{data.items.map(item => <button key={item.id} aria-pressed={selected?.id === item.id} onClick={() => selectInquiry(item)} disabled={saving} className="inbox-list-item"><div><span className={`inquiry-badge status-${item.status}`}>{INQUIRY_STATUSES[item.status]}</span><time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time></div><h2>{item.name} <span>{item.kind}</span></h2><p>{item.message}</p>{item.region && <span className="inbox-item-region">{item.region}</span>}</button>)}{data.cursor && <Button variant="outline" className="inbox-more" onClick={() => void loadMore()} disabled={more}>{more ? "불러오는 중…" : "문의 더 보기"}</Button>}</section>{selected ? <InquiryDetail key={`${selected.id}-${selected.revision}`} inquiry={selected} onUpdated={updated} onDeleted={deleted} onBack={() => selectInquiry(null)} onDirtyChange={setDirty} onBusyChange={setSaving} /> : <div className="inbox-detail-placeholder"><Inbox size={30} /><h2>확인할 문의를 선택해주세요.</h2><p>연락처와 상세 내용, 상담 메모를 확인할 수 있어요.</p></div>}</div>}
  </main></>;
}
