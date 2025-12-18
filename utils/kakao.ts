"use client";

type KakaoShareOptions = {
  objectType: "text";
  text: string;
  link: {
    mobileWebUrl: string;
    webUrl: string;
  };
};

interface KakaoShare {
  sendDefault(options: KakaoShareOptions): void;
}

export interface KakaoSDK {
  init(key?: string): void;
  isInitialized(): boolean;
  Share: KakaoShare;
}

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

// 카카오톡 텍스트 메시지 전송 유틸
export const sendKakaoMessage = (message: string) => {
  if (typeof window === "undefined") return;

  const { Kakao } = window;
  if (!Kakao) {
    console.error("❌ Kakao SDK not loaded");
    return;
  }

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
