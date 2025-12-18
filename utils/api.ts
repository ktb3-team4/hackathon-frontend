type GenerateMessagePayload = {
  target: string;
  situation: string;
};

type GenerateMessageResponse = {
  messages: string[];
};

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
const apiPrefix = apiBase ? `${apiBase.replace(/\/api\/?$/, "")}/api` : "";

/**
 * 메시지 생성 요청.
 * 실제 백엔드 엔드포인트가 준비되지 않은 경우에도 동작하도록
 * 실패 시 기본 문구를 반환한다.
 */
export async function generateMessage(
  payload: GenerateMessagePayload
): Promise<GenerateMessageResponse> {
  if (!apiPrefix) {
    return {
      messages: [
        `${payload.target}에게 보낼 메시지를 준비 중입니다. (${payload.situation})`,
      ],
    };
  }

  try {
    const res = await fetch(`${apiPrefix}/messages/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const json = (await res.json()) as Partial<GenerateMessageResponse>;
    if (Array.isArray(json.messages) && json.messages.length > 0) {
      return { messages: json.messages };
    }
  } catch (error) {
    console.error("[generateMessage] failed", error);
  }

  return {
    messages: [
      `${payload.target}에게 "${payload.situation}"에 대해 이야기해 볼까요?`,
    ],
  };
}
