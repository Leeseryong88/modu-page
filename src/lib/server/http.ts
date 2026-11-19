import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SITE_ORIGIN } from "@/lib/brand";
import { admin, AppError } from "./firebase";
export function assertOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowed = new Set([SITE_ORIGIN]);
  if (!process.env.VERCEL) { allowed.add("http://localhost:3000"); allowed.add("http://127.0.0.1:3000"); }
  if (!origin || !allowed.has(origin)) throw new AppError(403, "허용되지 않은 요청이에요. 페이지를 새로고침해주세요.");
}
export async function requireUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new AppError(401, "로그인이 필요해요.");
  try { return await admin().auth.verifyIdToken(token, true); }
  catch (e) { if (e instanceof AppError) throw e; throw new AppError(401, "로그인 시간이 만료됐어요. 다시 로그인해주세요."); }
}
export async function jsonBody(req: NextRequest) {
  const body = await req.text();
  if (Buffer.byteLength(body) > 128_000) throw new AppError(413, "입력 내용이 너무 많아요.");
  try { return JSON.parse(body); } catch { throw new AppError(400, "요청 내용을 확인해주세요."); }
}
export function errorResponse(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ error: "입력 내용을 확인해주세요.", issues: error.issues.map(i => ({ path: i.path.join("."), message: i.message })) }, { status: 400 });
  if (error instanceof AppError) return NextResponse.json({ error: error.message, issues: error.details }, { status: error.status });
  console.error("Request failed", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ error: "요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요." }, { status: 500 });
}
export const noStore = { "Cache-Control": "private, no-store, max-age=0" };
