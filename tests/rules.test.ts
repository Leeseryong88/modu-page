import { beforeAll, afterAll, describe, it } from "vitest";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { getBytes, ref, uploadBytes } from "firebase/storage";
let env: RulesTestEnvironment;
beforeAll(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error("에뮬레이터 전용 테스트입니다.");
  env = await initializeTestEnvironment({ projectId: "demo-woori", firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 }, storage: { rules: readFileSync("storage.rules", "utf8"), host: "127.0.0.1", port: 9199 } });
  await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), "sites/owner"), { draft: { name: "비공개" } }); await setDoc(doc(ctx.firestore(), "publicSites/rules-public"), { content: { name: "공개" } }); await uploadBytes(ref(ctx.storage(), "users/owner/media/test"), new Uint8Array([1]), { contentType: "image/webp" }); });
});
afterAll(async () => { if (env) { await env.withSecurityRulesDisabled(async ctx => { await deleteDoc(doc(ctx.firestore(), "publicSites/rules-public")); }); await env.cleanup(); } });
describe("Firestore·Storage 보안 규칙", () => {
  it("문의와 집계·접수 제한 정보는 소유자를 포함한 모든 직접 접근을 차단한다", async () => {
    await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), "inboxes/owner"), { total: 1 }); await setDoc(doc(ctx.firestore(), "inboxes/owner/messages/private"), { phone: "01000000000" }); });
    for (const context of [env.unauthenticatedContext(), env.authenticatedContext("owner"), env.authenticatedContext("other")]) {
      for (const path of ["inboxes/owner", "inboxes/owner/messages/private", "inquiryLimits/private"]) { await assertFails(getDoc(doc(context.firestore(), path))); await assertFails(setDoc(doc(context.firestore(), path), { forged: true })); }
    }
  });
  it("소유자는 자신의 초안만 읽고 직접 쓰기는 차단", async () => { const owner = env.authenticatedContext("owner").firestore(), other = env.authenticatedContext("other").firestore(); await assertSucceeds(getDoc(doc(owner, "sites/owner"))); await assertFails(getDoc(doc(other, "sites/owner"))); await assertFails(setDoc(doc(owner, "sites/owner"), { draft: "tamper" })); });
  it("비로그인은 공개본만 읽고 공개·주소 직접 쓰기 차단", async () => { const db = env.unauthenticatedContext().firestore(); await assertSucceeds(getDoc(doc(db, "publicSites/rules-public"))); await assertFails(getDoc(doc(db, "sites/owner"))); await assertFails(setDoc(doc(db, "publicSites/forged"), {})); await assertFails(getDoc(doc(db, "slugs/rules-public"))); });
  it("Storage 직접 업로드/타인 경로/SVG/5MB 초과/다운로드 토큰 주입 모두 차단", async () => {
    const storage = env.authenticatedContext("owner").storage(), file = new Uint8Array([1, 2, 3]);
    const path = () => `users/owner/uploads/${crypto.randomUUID()}`;
    await assertFails(uploadBytes(ref(storage, path()), file, { contentType: "image/jpeg", customMetadata: {} }));
    await assertFails(uploadBytes(ref(storage, `users/other/uploads/${crypto.randomUUID()}`), file, { contentType: "image/jpeg" }));
    await assertFails(uploadBytes(ref(storage, path()), file, { contentType: "image/svg+xml" }));
    await assertFails(uploadBytes(ref(storage, path()), new Uint8Array(5 * 1024 * 1024 + 1), { contentType: "image/png" }));
    await assertFails(uploadBytes(ref(storage, path()), file, { contentType: "image/png", customMetadata: { firebaseStorageDownloadTokens: "known-token" } }));
  });
  it("Storage 이미지 직접 다운로드는 익명·소유자 모두 차단 (인증 프록시만 사용)", async () => { await assertFails(getBytes(ref(env.unauthenticatedContext().storage(), "users/owner/media/test"))); await assertFails(getBytes(ref(env.authenticatedContext("owner").storage(), "users/owner/media/test"))); });
});
