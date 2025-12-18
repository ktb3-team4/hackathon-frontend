"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendKakaoMessage } from "@/utils/kakao";

type Target = {
  id: number;
  name: string;
  lastContact: string;
  recommendation: string;
  phone: string;
};

const MOCK_TARGETS: Target[] = [
  {
    id: 1,
    name: "엄마",
    lastContact: "3일 전",
    recommendation: "최근에 본 드라마나 영화 중에 기억에 남는 작품이 있어?",
    phone: "01012345678",
  },
  {
    id: 2,
    name: "아빠",
    lastContact: "1주 전",
    recommendation: "요즘 가장 재미있게 보고 계신 뉴스나 취미가 있으세요?",
    phone: "01023456789",
  },
  {
    id: 3,
    name: "할머니",
    lastContact: "2개월 전",
    recommendation: "요즘 어떻게 지내세요? 아프신 곳은 없죠?",
    phone: "01034567890",
  },
];

export default function HomePage() {
  const router = useRouter();

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSendKakao = (target: Target) => {
    sendKakaoMessage(target.recommendation);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6] flex flex-col max-w-md mx-auto shadow-xl relative font-sans text-gray-900">
      {/* 상단 헤더 */}
      <header className="bg-white sticky top-0 z-50 px-4 h-[60px] flex items-center shadow-sm justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👨‍👩‍👧‍👦</span>
          <h1 className="text-xl font-bold tracking-tight">두드림</h1>
        </div>
        <Link
          href="/login"
          className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition"
        >
          카카오 로그인
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {/* 로그인 유도 카드 */}
        <section className="bg-white rounded-2xl p-4 mb-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <p className="text-sm text-gray-500">개인화 준비 완료</p>
              <h2 className="text-lg font-bold">
                카카오로 로그인하고 저장해두세요
              </h2>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            로그인하면 추천 메시지와 연락 기록을 안전하게 보관할 수 있어요.
          </p>
          <Link
            href="/login"
            className="mt-3 inline-flex items-center gap-2 bg-[#FEE500] text-[#371D1E] font-bold text-sm px-4 py-2 rounded-xl hover:brightness-95 transition"
          >
            카카오로 시작하기 →
          </Link>
        </section>

        {/* 대상자 목록 */}
        <section>
          <h2 className="text-sm font-bold text-gray-800 mb-3 px-1">
            소중한 사람 목록
          </h2>

          <div className="space-y-4">
            {MOCK_TARGETS.map((item) => (
              <article
                key={item.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => alert(`${item.name}님 상세 모달 (기능 준비중)`)}
              >
                {/* 헤더 */}
                <div className="flex justify-between items-start mb-3">
                  <p className="text-lg font-bold">{item.name}</p>
                  <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">
                    마지막 연락 · {item.lastContact}
                  </span>
                </div>

                {/* 추천 메시지 */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-1">
                    추천 메시지
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {item.recommendation}
                  </p>
                </div>

                {/* 버튼 */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 bg-[#FEE500] text-[#371D1E] font-bold text-sm py-2 rounded-xl hover:brightness-95 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendKakao(item);
                    }}
                  >
                    카카오톡으로 전송
                  </button>
                  <button
                    type="button"
                    className="flex-1 border border-gray-300 text-gray-700 font-bold text-sm py-2 rounded-xl hover:bg-gray-50 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCall(item.phone);
                    }}
                  >
                    전화하기
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex justify-around py-2">
        <button
          type="button"
          className="flex flex-col items-center text-xs text-gray-500"
          onClick={() => router.push("/onboarding")}
        >
          <img
            src="/images/icon_list.png"
            alt="대상자"
            className="w-6 h-6 mb-1"
          />
          대상자
        </button>

        <button
          type="button"
          className="flex flex-col items-center text-xs font-bold text-blue-600"
          onClick={() => router.push("/")}
        >
          <img src="/images/icon_home.png" alt="홈" className="w-6 h-6 mb-1" />
          홈
        </button>

        <button
          type="button"
          className="flex flex-col items-center text-xs text-gray-500"
          onClick={() => router.push("/mypage")}
        >
          <img
            src="/images/icon_settings.png"
            alt="마이페이지"
            className="w-6 h-6 mb-1"
          />
          마이페이지
        </button>
      </nav>
    </div>
  );
}
