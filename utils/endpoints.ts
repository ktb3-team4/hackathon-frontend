// utils/endpoints.ts
// NOTE: 실제 API 연동 전까지 사용하는 목업 헬퍼입니다.

export type TargetEvent = {
  date: string;
  description: string;
};

export type Target = {
  id: number;
  name: string;
  relationshipId: number;
  chatStyleId: number;
  age: number;
  phoneNumber: string;
  birthday: string;
  interests?: string;
  events: TargetEvent[];
  lastMessageDate: string;
};

export type TargetPayload = Omit<Target, "id" | "lastMessageDate">;

export const API_BASE_URL = "";

/** ✅ Swagger 전 단계: 홈/목록 화면 유지용 MOCK 데이터 */
const MOCK_TARGETS: Target[] = [
  {
    id: 1,
    name: "엄마",
    relationshipId: 1,
    chatStyleId: 1,
    age: 50,
    phoneNumber: "01012345678",
    birthday: "1974-01-01",
    interests: "드라마, 산책",
    events: [{ date: "2025-01-10", description: "결혼기념일" }],
    lastMessageDate: "3일 전",
  },
  {
    id: 2,
    name: "아빠",
    relationshipId: 2,
    chatStyleId: 1,
    age: 55,
    phoneNumber: "01023456789",
    birthday: "1970-01-01",
    interests: "뉴스, 등산",
    events: [],
    lastMessageDate: "1주 전",
  },
];

/** =========================
 * ✅ Swagger 붙이기 전: API 함수들 (모킹)
 * ========================= */

/** 대상자 목록 */
export async function getTargets(): Promise<Target[]> {
  // 나중에 swagger 붙이면 여기 fetch로 교체
  return MOCK_TARGETS;
}

/** 대상자 상세 */
export async function getTarget(targetId: number): Promise<Target | null> {
  return MOCK_TARGETS.find((t) => t.id === targetId) ?? null;
}

/** 대상자 등록 */
export async function postTarget(payload: TargetPayload): Promise<{ message: string }> {
  console.log("MOCK postTarget payload:", payload);
  return { message: "OK" };
}

/** 대상자 수정 */
export async function putTarget(targetId: number, payload: TargetPayload): Promise<{ message: string }> {
  console.log("MOCK putTarget targetId:", targetId, "payload:", payload);
  return { message: "OK" };
}

/** 대상자 삭제 */
export async function deleteTarget(targetId: number): Promise<{ message: string }> {
  console.log("MOCK deleteTarget targetId:", targetId);
  return { message: "OK" };
}

/** 최근 메시지 날짜 갱신 */
export async function updateMessageDate(targetId: number): Promise<{ message: string }> {
  console.log("MOCK updateMessageDate targetId:", targetId);
  return { message: "OK" };
}

/** AI 추천 메시지 생성 (프롬프트) */
export async function postPrompt(userInput: string): Promise<{ message: string; data: string }> {
  console.log("MOCK postPrompt userInput:", userInput);

  // 홈에서 보여줄 추천 메시지 “데모” 문자열
  return {
    message: "OK",
    data: "요즘 어떻게 지내? 오늘 하루 어땠는지 궁금해서 연락했어 🙂",
  };
}
