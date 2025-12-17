"use client"; // 이거 필수!

import Script from "next/script";

declare global {
  interface Window {
    Kakao: any; // 타입 에러 무시용
  }
}

export default function KakaoScript() {
  const onLoad = () => {
    // 카카오 스크립트가 로드되면 실행되는 함수
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
      console.log("✅ 카카오 SDK 초기화 완료!");
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