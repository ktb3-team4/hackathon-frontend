// app/result/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // URL에서 데이터 꺼내기용
import { generateMessage } from "../utils/api";    // 아까 만든 API 함수

export default function ResultPage() {
  const searchParams = useSearchParams();
  const target = searchParams.get("target") || "부모님";
  const situation = searchParams.get("situation") || "안부";

  const [resultMessage, setResultMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 페이지가 켜지자마자 실행!
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await generateMessage({ target, situation });
        if (response && response.messages.length > 0) {
          setResultMessage(response.messages[0]);
        }
      } catch (error) {
        setResultMessage("메시지 생성에 실패했어요.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessage();
  }, [target, situation]);

  const handleKakaoShare = () => {
    if (!(window as any).Kakao) return;
    
    (window as any).Kakao.Share.sendDefault({
      objectType: "text",
      text: resultMessage,
      link: {
        mobileWebUrl: "http://localhost:3000",
        webUrl: "http://localhost:3000",
      },
      buttonTitle: "나도 답장하기",
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
        
        {isLoading ? (
          <div className="py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">AI가 고민 중입니다...</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-6">💌 완성된 메시지</h2>
            <div className="bg-yellow-50 p-6 rounded-lg text-left text-gray-800 whitespace-pre-wrap mb-8 border border-yellow-200">
              {resultMessage}
            </div>

            <button
              onClick={handleKakaoShare}
              className="w-full py-4 bg-[#FEE500] text-black rounded-xl font-bold text-lg hover:bg-[#FDD835] flex items-center justify-center gap-2"
            >
              카카오톡으로 보내기
            </button>
            
            <a href="/onboarding" className="block mt-4 text-gray-400 text-sm underline">
              다시 만들기
            </a>
          </>
        )}
      </div>
    </main>
  );
}