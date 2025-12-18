"use client";

type KakaoLink = {
  mobileWebUrl: string;
  webUrl: string;
};

type KakaoTextShareOptions = {
  objectType: "text";
  text: string;
  link: KakaoLink;
};

type KakaoFeedShareOptions = {
  objectType: "feed";
  content: {
    title: string;
    description?: string;
    imageUrl: string;
    link: KakaoLink;
  };
  buttons?: Array<{
    title: string;
    link: KakaoLink;
  }>;
};

type KakaoShareOptions = KakaoTextShareOptions | KakaoFeedShareOptions;

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
type SendKakaoMessageOptions = {
  linkUrl?: string;
  imageUrl?: string;
  title?: string;
  buttonTitle?: string;
};

export const sendKakaoMessage = (
  message: string,
  options?: SendKakaoMessageOptions
) => {
  if (typeof window === "undefined") return;

  const appKey = process.env.NEXT_PUBLIC_KAKAO_API_KEY;
  if (!appKey) {
    alert("카카오 앱 키가 설정되지 않았습니다.");
    return;
  }

  const trimmedMessage = message?.trim();
  if (!trimmedMessage) {
    alert("보낼 메시지가 없습니다.");
    return;
  }

  const { Kakao } = window;
  if (!Kakao) {
    alert("카카오톡 공유 도구를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  if (!Kakao.isInitialized()) {
    Kakao.init(appKey);
  }

  const linkUrl = options?.linkUrl || window.location.origin;
  const link: KakaoLink = { mobileWebUrl: linkUrl, webUrl: linkUrl };
  const shareableImageUrl = options?.imageUrl;

  const useImage = Boolean(
    shareableImageUrl && /^https?:\/\//i.test(shareableImageUrl)
  );

  try {
    if (useImage) {
      Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: options?.title || "추천 메시지",
          description: trimmedMessage,
          imageUrl: shareableImageUrl as string,
          link,
        },
        buttons: [
          {
            title: options?.buttonTitle || "확인하기",
            link,
          },
        ],
      });
      return;
    }

    if (shareableImageUrl) {
      console.warn(
        "이미지 URL이 http/https가 아니어서 텍스트로만 전송합니다."
      );
    }

    Kakao.Share.sendDefault({
      objectType: "text",
      text: trimmedMessage,
      link,
    });
  } catch (error) {
    console.error("❌ Kakao 공유 실패", error);
    alert("카카오톡 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
};
