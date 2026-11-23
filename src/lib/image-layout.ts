import type { CSSProperties } from "react";
import type { ImageCrop, SiteContent, SiteImage } from "./schema";

export type ImageTarget = "hero" | "logo" | "new-project" | `project:${string}`;
export const IMAGE_DRAG_TYPE = "application/x-modu-image";
export function defaultCrop(position = "center", fit: ImageCrop["fit"] = "cover"): ImageCrop {
  return { x: 50, y: position === "top" ? 0 : position === "bottom" ? 100 : 50, zoom: 1, fit };
}
export function imageStyle(image: SiteImage, position = "center"): CSSProperties {
  if (!image.crop) return { objectPosition: position };
  const { x, y, zoom, fit } = image.crop;
  return { objectFit: fit, objectPosition: `${x}% ${y}%`, transform: `scale(${zoom})`, transformOrigin: `${x}% ${y}%` };
}
export function placeImage(content: SiteContent, target: ImageTarget, image: SiteImage): SiteContent {
  if (target === "hero" || target === "logo") return { ...content, [target]: image };
  if (target === "new-project") {
    if (content.projects.length >= 6) return content;
    return { ...content, projects: [...content.projects, { id: crypto.randomUUID(), image, title: "", description: "" }] };
  }
  return { ...content, projects: content.projects.map(p => `project:${p.id}` === target ? { ...p, image } : p) };
}
// Translate pointer movement into focal position, including contain-mode padding.
export function dragCrop(crop: ImageCrop, image: SiteImage, width: number, height: number, dx: number, dy: number): ImageCrop {
  const scale = (crop.fit === "cover" ? Math.max : Math.min)(width / image.width, height / image.height) * crop.zoom;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const overflowX = image.width * scale - width, overflowY = image.height * scale - height;
  return { ...crop, x: Math.abs(overflowX) < 1 ? crop.x : clamp(crop.x - dx / overflowX * 100), y: Math.abs(overflowY) < 1 ? crop.y : clamp(crop.y - dy / overflowY * 100) };
}
