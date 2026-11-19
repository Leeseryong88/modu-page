import { z } from "zod";

export const INQUIRY_KINDS = ["견적 문의", "예약·주문 문의", "기타 문의"] as const;
export const INQUIRY_STATUSES = { new: "새 문의", progress: "상담 중", done: "완료" } as const;
export const inquiryStatusSchema = z.enum(["new", "progress", "done"]);
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;
export const inquiryInputSchema = z.object({
  requestId: z.string().uuid(),
  name: z.string().trim().min(1, "성함을 입력해주세요.").max(40, "성함은 40자 이내로 입력해주세요."),
  phone: z.string().trim().min(1, "연락처를 입력해주세요.").max(24).refine(v => /^\+?[\d\s()-]+$/.test(v) && v.replace(/\D/g, "").length >= 8 && v.replace(/\D/g, "").length <= 15, "연락 가능한 전화번호를 확인해주세요."),
  kind: z.enum(INQUIRY_KINDS),
  region: z.string().trim().max(80, "지역은 80자 이내로 입력해주세요."),
  message: z.string().trim().min(10, "문의 내용을 10자 이상 적어주세요.").max(2000, "문의 내용은 2,000자 이내로 적어주세요."),
  consent: z.boolean().refine(v => v, "문의 답변을 위한 정보 제공에 동의해주세요."),
  website: z.string().max(0, "요청 내용을 확인해주세요."),
}).strict();
export type InquiryInput = z.infer<typeof inquiryInputSchema>;
export const inquiryUpdateSchema = z.object({ status: inquiryStatusSchema, note: z.string().trim().max(2000), revision: z.number().int().positive() }).strict();
export type Inquiry = {
  id: string; name: string; phone: string; kind: typeof INQUIRY_KINDS[number]; region: string; message: string;
  slug: string; siteName: string; createdAt: string; updatedAt: string; status: InquiryStatus; note: string; revision: number;
};
export type InquiryStats = { total: number; new: number; progress: number; done: number };
export type InquiryList = { items: Inquiry[]; stats: InquiryStats; cursor: string | null };
export const EMPTY_INQUIRY_STATS: InquiryStats = { total: 0, new: 0, progress: 0, done: 0 };
