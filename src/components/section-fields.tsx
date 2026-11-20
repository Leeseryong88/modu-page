"use client";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { INDUSTRIES, type SiteContent, type ValidationIssue } from "@/lib/schema";
import type { SiteSection } from "@/lib/section-layouts";
import { ImageUpload } from "./image-upload";
import { Button } from "./ui/button";
export function fieldId(path: string) { return `field-${path.replaceAll(".", "-")}`; }
function Field({ path, label, value, onChange, max, required = false, help, placeholder, multiline = false, error, type = "text" }: { path: string; label: string; value: string; onChange: (value: string) => void; max?: number; required?: boolean; help?: string; placeholder?: string; multiline?: boolean; error?: string; type?: string }) {
  const id = fieldId(path); const props = { id, value, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value), maxLength: max, placeholder, "aria-invalid": !!error, "aria-describedby": `${id}-hint${error ? ` ${id}-error` : ""}` };
  return <div className="field"><label htmlFor={id}>{label}<span className={required ? "required" : "optional"}>{required ? "필수" : "선택"}</span></label>{multiline ? <textarea {...props} rows={5} /> : <input {...props} type={type} />}<div className="field-meta" id={`${id}-hint`}><span>{help}</span>{max && <span>{value.length} / {max}자</span>}</div>{error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}</div>;
}

export function SectionFields({ section, content, setContent, ownerId, issues, clearIssue, uploads, onBusy, focusPath }: {
  section: SiteSection; content: SiteContent; setContent: Dispatch<SetStateAction<SiteContent>>; ownerId: string;
  issues: ValidationIssue[]; clearIssue: (key: string) => void; uploads: number; onBusy: (delta: number) => void; focusPath: string;
}) {
  const [openService, setOpenService] = useState(content.services[Number(issues.find(i => i.path.startsWith("services."))?.path.split(".")[1] || 0)]?.id || "");
  const [openProject, setOpenProject] = useState(content.projects[Number(issues.find(i => i.path.startsWith("projects."))?.path.split(".")[1] || 0)]?.id || "");
  const focusedService = focusPath.startsWith("services.") ? content.services[Number(focusPath.split(".")[1])]?.id : undefined;
  const focusedProject = focusPath.startsWith("projects.") ? content.projects[Number(focusPath.split(".")[1])]?.id : undefined;
  useEffect(() => { if (focusedService) setOpenService(focusedService); if (focusedProject) setOpenProject(focusedProject); }, [focusedService, focusedProject]);
  function update<K extends keyof SiteContent>(key: K, value: SiteContent[K]) { setContent(c => ({ ...c, [key]: value })); clearIssue(key); }
  function getError(path: string) { return issues.find(i => i.path === path)?.message; }
  function moveItem<K extends "services" | "projects">(key: K, index: number, direction: number) {
    const values = [...content[key]]; [values[index], values[index + direction]] = [values[index + direction], values[index]];
    update(key, values as SiteContent[K]);
  }
  function controls(key: "services" | "projects", i: number) {
    const label = key === "services" ? "서비스" : "사진과 사례";
    return <div className="item-controls"><Button type="button" variant="ghost" size="icon" disabled={i === 0} aria-label={`${i + 1}번째 ${label} 위로 이동`} onClick={() => moveItem(key, i, -1)}><ChevronUp size={18} /></Button><Button type="button" variant="ghost" size="icon" disabled={i === content[key].length - 1} aria-label={`${i + 1}번째 ${label} 아래로 이동`} onClick={() => moveItem(key, i, 1)}><ChevronDown size={18} /></Button><Button type="button" variant="ghost" size="icon" disabled={uploads > 0} aria-label={`${i + 1}번째 ${label} 삭제`} onClick={() => { if (confirm(`${i + 1}번째 ${label}를 초안에서 삭제할까요?`)) update(key, content[key].filter((_, index) => index !== i) as SiteContent[typeof key]); }}><Trash2 size={16} /></Button></div>;
  }
  function basicField(key: "name" | "region" | "tagline" | "about" | "phone" | "kakao" | "address" | "hours", label: string, options: { max?: number; required?: boolean; help?: string; placeholder?: string; multiline?: boolean; type?: string }) {
    return <Field key={key} path={key} label={label} value={content[key]} onChange={value => update(key, value)} error={getError(key)} {...options} />;
  }

  return <div className="section-fields">
    {section === "top" && <>      {basicField("name", "이름 또는 페이지 이름", { required: true, max: 30, placeholder: "예: 김하늘 / 주말의 작업실" })}
      <div className="field"><label htmlFor={fieldId("industry")}>페이지 용도<span className="required">필수</span></label><select id={fieldId("industry")} value={content.industry} onChange={e => update("industry", e.target.value as SiteContent["industry"])} aria-invalid={!!getError("industry")}><option value="">페이지 용도를 선택해주세요</option>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select>{getError("industry") && <p className="field-error">{getError("industry")}</p>}</div>
      {basicField("region", "활동 지역", { max: 50, help: "필요할 때만 입력해요. 온라인으로 활동한다면 비워두셔도 좋아요.", placeholder: "예: 서울 / 온라인" })}
      {basicField("tagline", "한 줄 소개", { required: true, max: 80, help: "나의 관심사나 활동, 제공하는 경험을 소개해주세요.", placeholder: "예: 일상에서 발견한 이야기를 디자인합니다." })}
      <div className="field"><label>대표 이미지<span className="required">공개 시 필수</span></label><p className="field-hint">프로필, 작품, 공간 등 나를 잘 표현하는 사진을 올려주세요. 가로 사진을 권장해요.</p><ImageUpload label="대표 이미지" value={content.hero} ownerId={ownerId} onChange={v => update("hero", v)} onBusy={onBusy} position={content.heroPosition} inputId={fieldId("hero")} error={getError("hero")} /></div>
      {content.hero && <div className="field"><label htmlFor="hero-position">사진에서 보여줄 부분</label><select id="hero-position" value={content.heroPosition} onChange={e => update("heroPosition", e.target.value as SiteContent["heroPosition"])}><option value="center">중앙</option><option value="top">위쪽</option><option value="bottom">아래쪽</option></select><p className="field-hint">위의 사진과 실제 홈페이지에 같은 위치로 적용돼요.</p></div>}
      <details className="optional-section"><summary>로고 등록<span className="optional">선택</span></summary><p className="field-hint">로고가 없으면 페이지 이름이 텍스트 로고로 보여요.</p><ImageUpload label="로고" value={content.logo} ownerId={ownerId} onChange={v => update("logo", v)} onBusy={onBusy} logo inputId={fieldId("logo")} /></details>
</>}
    {section === "middle" && <>      {basicField("about", "상세 소개", { max: 1000, multiline: true, help: "자기소개, 활동 배경이나 나만의 이야기를 들려주세요.", placeholder: "나의 경험과 관심사, 함께하고 싶은 일을 소개해주세요." })}
      <div className="form-section-title"><h2>경험·활동·서비스<span className="optional">선택 · 최대 6개</span></h2><p>보여주고 싶은 역량, 클래스, 메뉴나 서비스를 카드로 정리해요.</p></div>
      {content.services.map((s, i) => <div key={s.id} className="repeater-item"><div className="repeater-heading"><button className="item-title" disabled={uploads > 0} aria-expanded={openService === s.id} onClick={() => setOpenService(openService === s.id ? "" : s.id)}>{s.title || `서비스 ${i + 1}`}<ChevronDown size={16} /></button>{controls("services", i)}</div>{openService === s.id && <div className="repeater-body"><Field path={`services.${i}.title`} label="항목 이름" required value={s.title} onChange={v => update("services", content.services.map(x => x.id === s.id ? { ...x, title: v } : x))} max={30} placeholder="예: 브랜드 디자인 / 주말 드로잉 클래스" error={getError(`services.${i}.title`)} /><Field path={`services.${i}.description`} label="항목 설명" value={s.description} onChange={v => update("services", content.services.map(x => x.id === s.id ? { ...x, description: v } : x))} max={160} multiline placeholder="상품이나 서비스의 특징을 간단하게 알려주세요." error={getError(`services.${i}.description`)} /></div>}</div>)}
      {content.services.length < 6 && <Button variant="outline" className="full-width" onClick={() => { const id = crypto.randomUUID(); update("services", [...content.services, { id, title: "", description: "" }]); setOpenService(id); }}><Plus size={17} />항목 추가 ({content.services.length}/6)</Button>}
      <div className="form-section-title"><h2>사진과 사례<span className="optional">선택 · 최대 6개</span></h2><p>포트폴리오, 활동 기록, 공간이나 상품을 사진으로 보여주세요.</p></div>
      {content.projects.map((p, i) => <div key={p.id} className="repeater-item"><div className="repeater-heading"><button className="item-title" disabled={uploads > 0} aria-expanded={openProject === p.id} onClick={() => setOpenProject(openProject === p.id ? "" : p.id)}>{p.title || `사진 ${i + 1}`}<ChevronDown size={16} /></button>{controls("projects", i)}</div>{openProject === p.id && <div className="repeater-body"><ImageUpload label={`${i + 1}번째 소개 사진`} value={p.image} ownerId={ownerId} onChange={v => setContent(c => ({ ...c, projects: c.projects.map(x => x.id === p.id ? { ...x, image: v } : x) }))} onBusy={onBusy} inputId={fieldId(`projects.${i}.image`)} error={getError(`projects.${i}.image`)} /><Field path={`projects.${i}.title`} label="사진 제목" required value={p.title} onChange={v => update("projects", content.projects.map(x => x.id === p.id ? { ...x, title: v } : x))} max={50} placeholder="예: 창가 자리 / 계절 꽃다발 / 이사 현장" error={getError(`projects.${i}.title`)} /><Field path={`projects.${i}.description`} label="사진 설명" value={p.description} onChange={v => update("projects", content.projects.map(x => x.id === p.id ? { ...x, description: v } : x))} max={200} multiline placeholder="사진에 담긴 상품, 공간, 서비스를 소개해주세요." error={getError(`projects.${i}.description`)} /></div>}</div>)}
      {content.projects.length < 6 && <Button variant="outline" className="full-width" onClick={() => { const id = crypto.randomUUID(); update("projects", [...content.projects, { id, title: "", description: "", image: null }]); setOpenProject(id); }}><Plus size={17} />사진 추가 ({content.projects.length}/6)</Button>}
      <p className="photo-notice">방문자에게 공개해도 되는 사진을 사용하고, 얼굴이나 상세 주소 등 공개하고 싶지 않은 정보가 없는지 확인해주세요.</p>
</>}
    {section === "bottom" && <>      {basicField("phone", "전화번호", { help: "선택사항이에요. 번호 공개 없이 온라인 문의만 받을 수도 있어요.", type: "tel", placeholder: "예: 010-1234-5678", max: 24 })}
      {basicField("kakao", "카카오톡 상담 URL", { type: "url", help: "방문자이 상담할 수 있는 카카오톡 채널 또는 채팅 링크를 넣어주세요.", placeholder: "예: https://pf.kakao.com/채널주소", max: 2000 })}
      {basicField("address", "주소", { max: 200, placeholder: "공개하고 싶은 공간의 주소" })}
      {basicField("hours", "활동·운영 시간", { max: 100, placeholder: "예: 평일 09:00–18:00, 일요일 휴무" })}
      <div className="form-section-title"><h2>외부 링크<span className="optional">선택 · 최대 3개</span></h2><p>블로그, SNS, 이력서 등 나를 더 알 수 있는 주소를 넣어주세요.</p></div>
      {content.links.map((l, i) => <div key={l.id} className="repeater-item"><Field path={`links.${i}.label`} label="링크 이름" value={l.label} onChange={v => update("links", content.links.map(x => x.id === l.id ? { ...x, label: v } : x))} max={40} placeholder="예: 나의 블로그 / 이력서 보기" error={getError(`links.${i}.label`)} /><Field path={`links.${i}.url`} label="링크 주소" type="url" value={l.url} onChange={v => update("links", content.links.map(x => x.id === l.id ? { ...x, url: v } : x))} placeholder="https://" error={getError(`links.${i}.url`)} /><Button variant="ghost" size="sm" onClick={() => update("links", content.links.filter(x => x.id !== l.id))}><Trash2 size={15} />링크 삭제</Button></div>)}
      {content.links.length < 3 && <Button variant="outline" className="full-width" onClick={() => update("links", [...content.links, { id: crypto.randomUUID(), label: "", url: "" }])}><Plus size={17} />외부 링크 추가</Button>}
<div className="form-section-title"><h2>온라인 문의</h2><p>방문자이 홈페이지에서 문의를 남길 수 있어요.</p></div><fieldset className="inquiry-options"><legend>문의하기 기능</legend>{[{ enabled: true, title: "문의하기 사용", description: "방문자이 이름, 연락처, 문의 내용을 남길 수 있어요. 접수한 내용은 문의함에서 확인해요." }, { enabled: false, title: "문의하기 사용 안 함", description: "문의 작성 양식을 표시하지 않아요. 전화와 카카오톡 연락 버튼은 그대로 사용할 수 있어요." }].map(option => <label key={String(option.enabled)} className={((content.inquiryEnabled !== false) === option.enabled) ? "selected" : ""}><input type="radio" name="inquiryEnabled" checked={(content.inquiryEnabled !== false) === option.enabled} onChange={() => update("inquiryEnabled", option.enabled)} /><span><strong>{option.title}</strong><span>{option.description}</span></span></label>)}</fieldset><p className="notice">설정은 홈페이지를 공개하거나 공개 내용을 업데이트할 때 적용돼요. 사용을 중단해도 이전에 받은 문의와 집계는 문의함에 남아 있어요.</p></>}
  </div>;
}
