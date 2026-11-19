import sharp from "sharp";
import { mkdir } from "node:fs/promises";
await mkdir(".local", { recursive: true });
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><rect width="1200" height="900" fill="#ddd8cf"/><rect x="100" y="100" width="450" height="650" fill="#f5f2eb"/><rect x="650" y="200" width="400" height="500" fill="#718070"/><path d="M0 820L1200 750V900H0" fill="#b0a18b"/><text x="100" y="850" font-family="sans-serif" font-size="30" fill="#fff">LOCAL LAYOUT TEST · NOT A REAL PROJECT</text></svg>`;
await sharp(Buffer.from(svg)).png().toFile(".local/review-image.png");
await sharp(Buffer.from(svg)).resize(600, 1000, { fit: "cover" }).png().toFile(".local/review-portrait.png");
