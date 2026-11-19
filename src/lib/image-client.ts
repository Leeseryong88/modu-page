// Keep requests below Vercel's 4.5 MB body limit. Original files are limited to 5 MB.
// Final validation and metadata removal also run on the server.
export async function prepareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error("사진의 해상도가 너무 커요. 4,000만 화소 이하 사진을 선택해주세요.");
    const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d"); if (!context) throw new Error("사진을 처리하지 못했어요. 다른 브라우저에서 시도해주세요.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("사진을 읽지 못했어요.")), "image/webp", .87));
    if (blob.size > 4_000_000) throw new Error("사진을 충분히 줄이지 못했어요. 조금 작은 사진을 선택해주세요.");
    return blob;
  } finally { bitmap.close(); }
}
