import "server-only";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
export class AppError extends Error {
  constructor(public status: number, message: string, public details?: unknown) { super(message); }
}
export function admin() {
  const emulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
  if (emulator && process.env.VERCEL) throw new AppError(503, "서비스 연결 설정을 확인하고 있어요. 잠시 후 다시 시도해주세요.");
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!projectId || !storageBucket) throw new AppError(503, "서비스 연결 설정이 필요해요. 관리자에게 문의해주세요.");
  if (emulator) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
    process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= "127.0.0.1:9199";
  }
  const app = getApps()[0] || initializeApp({ projectId, storageBucket, ...(emulator ? {} : {
    credential: process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
      ? cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") })
      : applicationDefault()
  }) });
  return { auth: getAuth(app), db: getFirestore(app), bucket: getStorage(app).bucket() };
}
