import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => { for (const key of ["API_KEY", "AUTH_DOMAIN", "PROJECT_ID", "STORAGE_BUCKET", "APP_ID"]) process.env[`NEXT_PUBLIC_FIREBASE_${key}`] = "demo-test"; process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS = "false"; return { popup: vi.fn(), auth: { name: "test-auth" } }; });
vi.mock("firebase/auth", async importOriginal => ({ ...await importOriginal<typeof import("firebase/auth")>(), getAuth: () => mocks.auth, signInWithPopup: mocks.popup }));
vi.mock("firebase/app", () => ({ getApps: () => [{}], getApp: () => ({}) }));
vi.mock("firebase/storage", () => ({ getStorage: () => ({}) }));
import { authMessage, signInWithGoogle } from "@/lib/firebase-client";
beforeEach(() => { vi.clearAllMocks(); });
describe("Google authentication", () => {
  it("opens Google account selection without requesting extra scopes", async () => {
    mocks.popup.mockResolvedValue({ user: { uid: "existing-owner" } });
    await expect(signInWithGoogle()).resolves.toEqual({ user: { uid: "existing-owner" } });
    const [auth, provider] = mocks.popup.mock.calls[0];
    expect(auth).toBe(mocks.auth); expect(provider.providerId).toBe("google.com");
    expect(provider.getCustomParameters()).toEqual({ prompt: "select_account" });
    expect(provider.getScopes()).not.toContain("https://www.googleapis.com/auth/contacts.readonly");
  });
  it.each(["auth/popup-closed-by-user", "auth/popup-blocked", "auth/unauthorized-domain", "auth/operation-not-allowed", "auth/account-exists-with-different-credential"])("keeps authentication failures visible: %s", async code => {
    mocks.popup.mockRejectedValue({ code }); await expect(signInWithGoogle()).rejects.toEqual({ code });
    expect(authMessage({ code })).not.toBe(authMessage({ code: "unknown" }));
  });
});
