import { firebaseClient } from "./firebase-client";
import { prepareImage } from "./image-client";
import type { SiteImage } from "./schema";

export async function uploadLibraryImage(file: File, onProgress: (value: number) => void): Promise<SiteImage> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024 || !file.size) throw new Error("5MB 이하의 JPG, PNG, WebP 사진을 선택해주세요.");
  const prepared = await prepareImage(file);
  const token = await firebaseClient().auth.currentUser?.getIdToken();
  if (!token) throw new Error("로그인을 다시 확인해주세요.");
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media/upload");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", prepared.type);
    xhr.setRequestHeader("X-Image-Id", crypto.randomUUID());
    xhr.timeout = 90000;
    xhr.upload.onprogress = event => { if (event.lengthComputable) onProgress(Math.min(99, Math.round(event.loaded / event.total * 100))); };
    xhr.onerror = () => reject(new Error("인터넷 연결을 확인하고 다시 올려주세요."));
    xhr.ontimeout = () => reject(new Error("등록 시간이 초과됐어요. 다시 올려주세요."));
    xhr.onload = () => {
      try { const data = JSON.parse(xhr.responseText); if (xhr.status >= 200 && xhr.status < 300) resolve(data); else reject(new Error(data.error || "사진을 등록하지 못했어요.")); }
      catch { reject(new Error("사진을 등록하지 못했어요. 다시 올려주세요.")); }
    };
    xhr.send(prepared);
  });
}
