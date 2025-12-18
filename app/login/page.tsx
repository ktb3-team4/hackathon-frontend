"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";

export default function LoginPage() {
  const router = useRouter();

  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
  const clientId = process.env.NEXT_PUBLIC_KAKAO_API_KEY;

  const kakaoLoginUrl = useMemo(() => {
    if (!redirectUri || !clientId) return null;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
    });
    return `${KAKAO_AUTHORIZE_URL}?${params.toString()}`;
  }, [clientId, redirectUri]);

  const handleLogin = () => {
    if (!kakaoLoginUrl) {
      alert("카카오 로그인 환경변수가 설정되지 않았습니다.");
      return;
    }
    window.location.href = kakaoLoginUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9EEC2] via-white to-[#F4F7FB] flex flex-col max-w-md mx-auto shadow-xl font-sans text-gray-900">
      <header className="px-5 pt-10 pb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-semibold">두드림</p>
          <h1 className="text-2xl font-black tracking-tight mt-1">카카오로 시작하기</h1>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          닫기 ✕
        </button>
      </header>

      <main className="flex-1 px-5 pb-12 flex flex-col gap-10">
        <section className="bg-white rounded-3xl shadow p-6 border border-gray-100">
          <p className="text-lg font-bold mb-2">따뜻한 연락, 한 번의 로그인으로</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            카카오 계정으로 로그인하면 추천 메시지를 저장하고,<br />
            가족 이벤트를 한곳에서 관리할 수 있어요.
          </p>
        </section>

        <section className="bg-[#371D1E] text-white rounded-3xl p-6 shadow flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💌</span>
            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">Kakao Login</p>
              <h2 className="text-xl font-black">3초 만에 시작</h2>
            </div>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            로그인 후에는 자동으로 홈으로 이동합니다.
            카카오 인증 창이 열리면 안내에 따라 진행해주세요.
          </p>
          <button
            onClick={handleLogin}
            className="mt-2 w-full bg-[#FEE500] text-[#371D1E] font-extrabold text-base py-3 rounded-xl hover:brightness-95 transition"
          >
            카카오 계정으로 계속하기
          </button>
        </section>

        <section className="space-y-3">
          <p className="text-xs text-gray-500">도움이 필요하신가요?</p>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-sm text-gray-700 shadow-sm">
            로그인에 문제가 있으면 카카오 계정 상태를 확인하고,
            재시도 후에도 실패하면 관리자에게 문의해주세요.
          </div>
        </section>
      </main>
    </div>
  );
}
