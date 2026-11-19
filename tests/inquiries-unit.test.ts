import { describe, expect, it } from "vitest";
import { inquiryInputSchema, inquiryUpdateSchema } from "@/lib/inquiries";
const valid = { requestId: crypto.randomUUID(), name: " 김고객 ", phone: "010-1234-5678", kind: "견적 문의", region: "수원", message: "주방 리모델링 견적을 문의합니다.", consent: true, website: "" };
describe("문의 입력 검증", () => {
  it("동의를 받고 공백을 정리한 유효한 문의만 받는다", () => { expect(inquiryInputSchema.parse(valid).name).toBe("김고객"); expect(inquiryInputSchema.safeParse({ ...valid, consent: false }).success).toBe(false); });
  it.each([{ name: " " }, { phone: "123" }, { phone: "javascript:alert(1)" }, { message: "짧음" }, { message: "가".repeat(2001) }, { ownerId: "other" }, { status: "done" }, { website: "bot.example" }])("유효하지 않은 값과 소유자·상태 주입을 거부한다: %j", change => { expect(inquiryInputSchema.safeParse({ ...valid, ...change }).success).toBe(false); });
  it("관리 변경은 상태·메모·현재 버전만 허용한다", () => { expect(inquiryUpdateSchema.safeParse({ status: "done", note: "상담 완료", revision: 1 }).success).toBe(true); expect(inquiryUpdateSchema.safeParse({ status: "done", note: "", revision: 0 }).success).toBe(false); expect(inquiryUpdateSchema.safeParse({ status: "done", note: "", revision: 1, phone: "01000000000" }).success).toBe(false); });
});
