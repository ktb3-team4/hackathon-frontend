"use client";

// 카카오톡 텍스트 메시지 전송 유틸
export const sendKakaoMessage = (message: string) => {
  if (typeof window === "undefined") return;

  const { Kakao } = window as any;
  if (!Kakao) {
    console.error("❌ Kakao SDK not loaded");
    return;
  }

  // 혹시 초기화 안 되어 있으면 한 번 더 초기화
  if (!Kakao.isInitialized()) {
    Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
  }

  Kakao.Share.sendDefault({
    objectType: "text",
    text: message,
    link: {
      mobileWebUrl: window.location.origin,
      webUrl: window.location.origin,
    },
  });
};
