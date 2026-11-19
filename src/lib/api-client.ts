import { firebaseClient } from "./firebase-client";
import type { ValidationIssue } from "./schema";
export class ApiError extends Error { constructor(message: string, public status: number, public issues?: ValidationIssue[]) { super(message); } }
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const user = firebaseClient().auth.currentUser;
  if (!user) throw new ApiError("로그인이 필요해요.", 401);
  const token = await user.getIdToken();
  const res = await fetch(url, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers } });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error || "요청을 처리하지 못했어요.", res.status, data.issues);
  return data as T;
}
