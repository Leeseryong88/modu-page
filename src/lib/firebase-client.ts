import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(firebaseClient().auth, provider);
}
export function authMessage(error: unknown) {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    "auth/popup-closed-by-user": "구글 로그인 창이 닫혔어요. 다시 눌러 로그인해주세요.",
    "auth/popup-blocked": "팝업이 차단됐어요. 이 사이트의 팝업을 허용한 뒤 다시 눌러주세요.",
    "auth/cancelled-popup-request": "이미 로그인 창이 열려 있어요. 해당 창에서 계정을 선택해주세요.",
    "auth/unauthorized-domain": "이 사이트의 구글 로그인 연결을 준비 중이에요. 관리자에게 문의해주세요.",
    "auth/account-exists-with-different-credential": "같은 이메일로 가입된 계정이 있어요. 기존 홈페이지 연결을 위해 관리자에게 문의해주세요.",
    "auth/user-disabled": "사용이 중지된 계정이에요. 관리자에게 문의해주세요.",
    "auth/operation-not-supported-in-this-environment": "이 브라우저에서는 구글 로그인을 열 수 없어요. Chrome이나 Safari에서 다시 시도해주세요.",
    "auth/too-many-requests": "요청이 많아요. 잠시 후 다시 시도해주세요.",
    "auth/network-request-failed": "인터넷 연결을 확인한 뒤 다시 시도해주세요.",
    "auth/operation-not-allowed": "현재 구글 로그인을 이용할 수 없어요. 관리자에게 문의해주세요.",
  };
  return messages[code || ""] || "처리하지 못했어요. 잠시 후 다시 시도해주세요.";
}
