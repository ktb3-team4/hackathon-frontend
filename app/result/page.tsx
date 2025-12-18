// app/result/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // URL에서 데이터 꺼내기용
import { generateMessage } from "@/utils/api"; // 메시지 생성 API
import { sendKakaoMessage } from "@/utils/kakao";

export default function ResultPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center">로딩 중...</main>}>
      <ResultPageInner />
    </Suspense>
  );
}

function ResultPageInner() {
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
    sendKakaoMessage(resultMessage, {
      linkUrl: typeof window !== "undefined" ? window.location.origin : undefined,
    });
  };

  const handleDownloadImage = () => {
    if (typeof window === "undefined") return;
    const text = resultMessage.trim();
    if (!text) {
      alert("저장할 메시지가 없습니다.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 배경
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#fff4e6");
    gradient.addColorStop(1, "#ffe3ec");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 카드 영역
    ctx.fillStyle = "#ffffff";
    ctx.roundRect(80, 160, canvas.width - 160, canvas.height - 320, 36);
    ctx.fill();

    // 제목
    ctx.fillStyle = "#f97316";
    ctx.font = "700 44px 'Pretendard', 'Noto Sans KR', sans-serif";
    ctx.fillText("추천 메시지", 140, 240);

    // 본문
    ctx.fillStyle = "#111827";
    ctx.font = "500 36px 'Pretendard', 'Noto Sans KR', sans-serif";
    const maxWidth = canvas.width - 220;
    const lines = wrapText(ctx, text, maxWidth);
    const startY = 320;
    const lineHeight = 56;
    lines.forEach((line, idx) => {
      ctx.fillText(line, 140, startY + idx * lineHeight);
    });

    // 워터마크
    ctx.font = "600 30px 'Pretendard', 'Noto Sans KR', sans-serif";
    ctx.fillStyle = "#9ca3af";
    ctx.fillText("두드림", canvas.width - 200, canvas.height - 120);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "dodream-message.png";
    link.click();
  };

  const wrapText = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";

    const pushLine = (value: string) => {
      if (value) lines.push(value);
    };

    // 공백 기준으로 먼저 자르고, 단어가 너무 길면 문자 단위로 쪼갠다.
    for (const word of words.length ? words : [text]) {
      let tempWord = word;
      while (context.measureText(tempWord).width > maxWidth && tempWord.length > 0) {
        let slice = "";
        for (const char of tempWord) {
          const next = slice + char;
          if (context.measureText(next).width > maxWidth) break;
          slice = next;
        }
        pushLine(slice);
        tempWord = tempWord.slice(slice.length);
      }

      if (!line) {
        line = tempWord;
        continue;
      }

      const testLine = `${line} ${tempWord}`.trim();
      if (context.measureText(testLine).width > maxWidth) {
        pushLine(line);
        line = tempWord;
      } else {
        line = testLine;
      }
    }

    pushLine(line);
    return lines;
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

            <div className="flex flex-col gap-3 mb-1">
              <button
                onClick={handleDownloadImage}
                className="w-full py-3 border border-dashed border-[#f59e0b] text-[#b45309] rounded-xl font-semibold hover:bg-[#fff7e6] flex items-center justify-center gap-2"
              >
                <span aria-hidden>🖼️</span>
                추천 메시지 이미지로 저장
              </button>

              <button
                onClick={handleKakaoShare}
                className="w-full py-4 bg-[#FEE500] text-black rounded-xl font-bold text-lg hover:bg-[#FDD835] flex items-center justify-center gap-2"
              >
                카카오톡으로 보내기
              </button>
            </div>
            
            <a href="/onboarding" className="block mt-4 text-gray-400 text-sm underline">
              다시 만들기
            </a>
          </>
        )}
      </div>
    </main>
  );
}
