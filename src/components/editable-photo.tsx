"use client";
import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, SlidersHorizontal } from "lucide-react";
import { IMAGE_DRAG_TYPE, imageStyle, type ImageTarget } from "@/lib/image-layout";
import type { SiteImage } from "@/lib/schema";

export type PhotoEditing = {
  selectedImage: SiteImage | null;
  disabled: boolean;
  resolveImage: (id: string) => SiteImage | undefined;
  onPlace: (target: ImageTarget, image: SiteImage) => void;
  onAdjust: (target: ImageTarget, image: SiteImage, ratio: number) => void;
  onChoose: () => void;
};
export function EditablePhoto({ target, image, src, label, className = "", position = "center", editing }: {
  target: ImageTarget; image: SiteImage | null; src?: string; label: string; className?: string; position?: string; editing: PhotoEditing;
}) {
  const [over, setOver] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  function accepts(event: DragEvent) { return !editing.disabled && event.dataTransfer.types.includes(IMAGE_DRAG_TYPE); }
  function adjust() {
    if (!image || !frame.current) return;
    const rect = frame.current.getBoundingClientRect();
    editing.onAdjust(target, image, rect.width / rect.height);
  }
  return <div ref={frame} className={`photo-slot ${className} ${over ? "drag-over" : ""} ${editing.selectedImage ? "accepting-photo" : ""}`}
    data-photo-target={target}
    onDragOver={event => { if (accepts(event)) { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setOver(true); } }}
    onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(false); }}
    onDrop={event => {
      setOver(false); if (!accepts(event)) return;
      event.preventDefault(); event.stopPropagation();
      const asset = editing.resolveImage(event.dataTransfer.getData(IMAGE_DRAG_TYPE));
      if (asset) editing.onPlace(target, asset);
    }}>
    {image && src ? <img src={src} alt={label} width={image.width} height={image.height} draggable={false} style={imageStyle(image, position)} /> : <div className="photo-slot-placeholder"><ImagePlus size={28} /><span>{label}</span></div>}
    <button type="button" className="photo-slot-select" disabled={editing.disabled} aria-label={editing.selectedImage ? `${label}에 선택한 사진 넣기` : `${label} ${image ? "구도 조절" : "사진 선택"}`} onClick={() => {
      if (editing.selectedImage) editing.onPlace(target, editing.selectedImage);
      else if (image) adjust(); else editing.onChoose();
    }}><span>{editing.selectedImage ? "여기에 사진 넣기" : image ? "사진 위치·확대 조절" : "사진을 끌어놓거나 눌러 선택"}</span></button>
    {image && <button type="button" className="photo-slot-adjust" disabled={editing.disabled} onClick={adjust} aria-label={`${label} 위치와 크기 조절`}><SlidersHorizontal size={15} />구도 조절</button>}
  </div>;
}
