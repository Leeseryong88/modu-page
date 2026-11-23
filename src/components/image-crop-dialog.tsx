"use client";
import { useRef, useState } from "react";
import { defaultCrop, dragCrop, imageStyle } from "@/lib/image-layout";
import type { ImageCrop, SiteImage } from "@/lib/schema";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

export function ImageCropDialog({ image, src, ratio, position, logo, onApply, onClose }: {
  image: SiteImage; src: string; ratio: number; position: string; logo: boolean;
  onApply: (crop: ImageCrop) => void; onClose: () => void;
}) {
  const initial = image.crop ?? defaultCrop(position, logo ? "contain" : "cover");
  const [crop, setCrop] = useState<ImageCrop>(initial);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const drag = useRef<{ x: number; y: number; width: number; height: number; crop: ImageCrop; pointer: number } | null>(null);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="image-crop-dialog">
    <DialogTitle>사진의 위치와 크기</DialogTitle>
    <DialogDescription>사진을 끌어 구도를 맞추세요. 원본은 그대로 보관하며, 현재 화면 비율로 보여드려요.</DialogDescription>
    <div className="crop-preview" style={{ aspectRatio: ratio, maxWidth: `min(100%, ${Math.max(180, 320 * ratio)}px)` }}
      onPointerDown={event => {
        if (!loaded || event.button !== 0) return;
        const rect = event.currentTarget.getBoundingClientRect();
        drag.current = { x: event.clientX, y: event.clientY, width: rect.width, height: rect.height, crop, pointer: event.pointerId };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => { const start = drag.current; if (start && start.pointer === event.pointerId) setCrop(dragCrop(start.crop, image, start.width, start.height, event.clientX - start.x, event.clientY - start.y)); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
      <img src={src} alt="사진 구도 미리보기" draggable={false} style={imageStyle({ ...image, crop })} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
      <span className="crop-grid" aria-hidden="true" />
    </div>
    {failed && <p role="alert" className="field-error">사진을 불러오지 못했어요. 창을 닫고 다시 시도해주세요.</p>}
    <div className="crop-fit" role="group" aria-label="사진 표시 방식">
      <button aria-pressed={crop.fit === "cover"} onClick={() => setCrop(c => ({ ...c, fit: "cover", zoom: 1 }))}>영역 채우기</button>
      <button aria-pressed={crop.fit === "contain"} onClick={() => setCrop({ ...defaultCrop(), fit: "contain" })}>사진 전체 보기</button>
    </div>
    <div className="crop-sliders">
      <label>확대·축소 <output>{Math.round(crop.zoom * 100)}%</output><input aria-label="사진 확대 비율" type="range" min={1} max={3} step={0.01} value={crop.zoom} onChange={event => setCrop(c => ({ ...c, zoom: Number(event.target.value) }))} /></label>
      <label>좌우 위치 <output>{Math.round(crop.x)}%</output><input aria-label="사진 좌우 위치" type="range" min={0} max={100} value={crop.x} onChange={event => setCrop(c => ({ ...c, x: Number(event.target.value) }))} /></label>
      <label>상하 위치 <output>{Math.round(crop.y)}%</output><input aria-label="사진 상하 위치" type="range" min={0} max={100} value={crop.y} onChange={event => setCrop(c => ({ ...c, y: Number(event.target.value) }))} /></label>
    </div>
    <p className="field-hint">휴대폰에서는 사진을 손가락으로 움직이거나 슬라이더를 사용하세요. 기기와 템플릿에 따라 사진 영역의 비율은 달라질 수 있어요.</p>
    <div className="crop-actions"><Button variant="ghost" onClick={() => setCrop(defaultCrop(position, logo ? "contain" : "cover"))}>구도 초기화</Button><Button variant="outline" onClick={onClose}>취소</Button><Button disabled={!loaded || failed} onClick={() => onApply(crop)}>적용하기</Button></div>
  </DialogContent></Dialog>;
}
