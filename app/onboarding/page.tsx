// app/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [target, setTarget] = useState("부모님");
  const [situation, setSituation] = useState("");

  const handleNext = () => {
    if (!situation) {
      alert("어떤 상황인지 입력해주세요!");
      return;
    }
    // 입력한 데이터를 URL에 싣고 결과 페이지로 이동!
    // 예: /result?target=부모님&situation=생신
    router.push(`/result?target=${target}&situation=${situation}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">
          어떤 메시지를 보낼까요?
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">받는 분</label>
            <select 
              value={target} 
              onChange={(e) => setTarget(e.target.value)}
              className="w-full p-4 border rounded-xl text-lg bg-gray-50 text-black"
            >
              <option value="부모님">부모님</option>
              <option value="배우자">배우자</option>
              <option value="친구">친구</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">상황</label>
            <input 
              type="text" 
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="예: 용돈 드리는 날, 생신"
              className="w-full p-4 border rounded-xl text-lg bg-gray-50 text-black"
            />
          </div>

          <button 
            onClick={handleNext}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 mt-6"
          >
            메시지 생성하러 가기 👉
          </button>
        </div>
      </div>
    </main>
  );
}