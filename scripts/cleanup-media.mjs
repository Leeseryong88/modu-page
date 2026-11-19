import { createRequire } from "node:module";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const projectId = process.env.FIREBASE_PROJECT_ID, storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
if (!projectId || !storageBucket) throw new Error("FIREBASE_PROJECT_ID and FIREBASE_STORAGE_BUCKET are required.");
const emulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
if (emulator) { process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080"; process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= "127.0.0.1:9199"; }
initializeApp({ projectId, storageBucket, ...(emulator ? {} : { credential: process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY ? cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") }) : applicationDefault() }) });
const db = getFirestore(), bucket = getStorage().bucket(), apply = process.argv.includes("--apply"), cutoff = Date.now() - 7 * 86400000;
function referenced(content, id) { return content && [content.hero?.id, content.logo?.id, ...(content.projects || []).map(p => p.image?.id)].includes(id); }
let count = 0;
for (const item of (await db.collectionGroup("media").get()).docs) {
  const parent = item.ref.parent.parent;
  if (!parent || parent.parent.id !== "sites") continue;
  const data = item.data();
  if (!data.createdAt || new Date(data.createdAt).getTime() >= cutoff) continue;
  const eligible = await db.runTransaction(async tx => {
    const [siteDoc, mediaDoc] = await tx.getAll(parent, item.ref);
    if (!mediaDoc.exists) return false;
    const site = siteDoc.data();
    if (referenced(site?.draft, item.id) || referenced(site?.published, item.id)) return false;
    // Publishing/saving reads this media document in its transaction, so either
    // the reference wins first or a concurrent save sees state=deleting and fails.
    if (apply) tx.update(item.ref, { state: "deleting" });
    return true;
  });
  if (!eligible) continue;
  count++;
  if (apply) { await bucket.file(`users/${parent.id}/media/${item.id}`).delete({ ignoreNotFound: true }); await item.ref.delete(); }
}
console.log(`${apply ? "Deleted" : "Eligible (dry run)"}: ${count} unreferenced images older than 7 days.`);
