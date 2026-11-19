import sharp from "sharp";
import { mkdir } from "node:fs/promises";
await mkdir("public/images", { recursive: true });
const source = "C:/Users/GENTLEMONSTER/.codex/generated_images/01a1f241-9aab-74f3-b426-05d39028e203/";
await sharp(source + "exec-a5e80d5f-bc91-41c4-9962-00fd2c5988f5.png").webp({ quality: 88 }).toFile("public/images/interior-editorial.webp");
await sharp(source + "exec-6d032dc1-c9cf-4145-af7b-3a579ee79705.png").webp({ quality: 87 }).toFile("public/images/craft-materials.webp");
