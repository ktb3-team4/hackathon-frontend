"use client"; // 이거 필수!

import Script from "next/script";

declare global {
  interface Window {
    Kakao: any;
  }
}

export default function KakaoScript() {
  const onLoad = () => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_API_KEY;
    if (!appKey) {
      console.error(
        "카카오 앱 키(NEXT_PUBLIC_KAKAO_API_KEY)가 설정되지 않았습니다."
      );
      return;
    }

    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(appKey);
      console.log("카카오 SDK 초기화 완료!");
    }
  };

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
      async
      onLoad={onLoad}
    />
  );
}
