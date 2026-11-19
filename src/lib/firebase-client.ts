import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectStorageEmulator, getStorage } from "firebase/storage";
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
export const firebaseConfigured = !!(config.apiKey && config.authDomain && config.projectId && config.storageBucket && config.appId);
let connected = false;
export function firebaseClient() {
  if (!firebaseConfigured) throw new Error("서비스 연결 설정이 필요해요. 관리자에게 문의해주세요.");
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app), storage = getStorage(app);
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" && !connected) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectStorageEmulator(storage, "127.0.0.1", 9199); connected = true;
  }
  return { auth, storage };
}
export function authMessage(error: unknown) {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "이미 가입된 이메일이에요. 로그인해주세요.",
    "auth/invalid-email": "올바른 이메일 주소를 입력해주세요.",
    "auth/invalid-credential": "이메일 또는 비밀번호를 확인해주세요.",
    "auth/user-not-found": "이메일 또는 비밀번호를 확인해주세요.",
    "auth/wrong-password": "이메일 또는 비밀번호를 확인해주세요.",
    "auth/weak-password": "비밀번호는 8자 이상으로 입력해주세요.",
    "auth/too-many-requests": "요청이 많아요. 잠시 후 다시 시도해주세요.",
    "auth/network-request-failed": "인터넷 연결을 확인한 뒤 다시 시도해주세요.",
    "auth/operation-not-allowed": "현재 이메일 가입을 이용할 수 없어요. 관리자에게 문의해주세요.",
  };
  return messages[code || ""] || "처리하지 못했어요. 잠시 후 다시 시도해주세요.";
}
