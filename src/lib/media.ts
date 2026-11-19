import type { SiteImage } from "./schema";
export function mediaUrl(uid: string, image: SiteImage) { return `/api/media/${uid}/${image.id}`; }
