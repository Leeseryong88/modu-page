import { Check } from "lucide-react";
import { SECTION_INFO, SECTION_TEMPLATES, type SiteSection } from "@/lib/section-layouts";
import type { SiteContent } from "@/lib/schema";

export function SectionTemplatePicker({ section, layout, onChange }: {
  section: SiteSection; layout: SiteContent["layout"]; onChange: (layout: SiteContent["layout"]) => void;
}) {
  return <fieldset className="template-picker">
    <legend className="sr-only">{SECTION_INFO[section].label} 템플릿 선택</legend>
    <div className="template-options">{SECTION_TEMPLATES[section].map(template => <label key={template.id} className={`template-option ${layout[section] === template.id ? "selected" : ""}`}>
      <input className="sr-only" type="radio" name={`template-${section}`} value={template.id} checked={layout[section] === template.id} onChange={() => onChange({ ...layout, [section]: template.id })} />
      <span className={`template-sketch sketch-${section} sketch-${template.id}`} aria-hidden="true"><span className="sketch-nav" /><span className="sketch-copy"><i /><i /><i /><b /></span><span className="sketch-photo" /><span className="sketch-items"><i /><i /><i /></span></span>
      <span className="template-option-title">{template.name}{layout[section] === template.id && <Check size={18} aria-hidden="true" />}</span><span className="template-description">{template.description}</span><span className="template-tag">{template.tag}</span>
    </label>)}</div><p className="template-reassurance">모양만 바뀌어요. 작성한 내용과 사진은 그대로 유지돼요.</p>
  </fieldset>;
}
