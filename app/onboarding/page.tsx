"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  
  // 동적 이벤트 리스트 상태
  const [events, setEvents] = useState<{ id: number }[]>([]);

  const addEvent = () => {
    setEvents([...events, { id: Date.now() }]);
  };

  const removeEvent = (id: number) => {
    setEvents(events.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto shadow-xl relative font-sans text-gray-900">
      
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-50 px-4 h-[60px] flex items-center border-b border-gray-100">
        <Link href="/" className="text-2xl mr-4 text-gray-500 no-underline">←</Link>
        <h1 className="text-lg font-bold">정보 등록</h1>
      </header>

      {/* 폼 본문 */}
      <main className="flex-1 overflow-y-auto p-5 pb-10">
        <form onSubmit={(e) => { e.preventDefault(); router.push('/'); }} className="space-y-8">
          
          <section className="flex flex-col gap-6">
            <h2 className="text-sm font-bold border-b border-gray-100 pb-2">대상자 정보</h2>
            
            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">이름</label>
              <input type="text" id="name" placeholder="홍길동" className="w-full p-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* 관계 */}
            <div>
              <label htmlFor="relation" className="block text-sm font-bold text-gray-700 mb-2">대상자와의 관계</label>
              <select id="relation" className="w-full p-3 bg-gray-50 rounded-lg outline-none">
                <option>엄마</option>
                <option>아빠</option>
                <option>할머니</option>
                <option>할아버지</option>
                <option>기타</option>
              </select>
            </div>

            {/* 연락처 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">연락처</label>
              <input type="tel" id="phone" placeholder="예: 010-1234-5678" className="w-full p-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* 말투 (HTML의 tone-options 재현) */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">어떤 말투가 편한가요?</p>
              <div className="grid grid-cols-2 gap-2">
                {['편한 반말', '존댓말', '애교 섞인 말투', '감성 진솔 모드'].map((tone, idx) => (
                  <label key={idx} className="cursor-pointer">
                    <input type="radio" name="tone" className="peer sr-only" defaultChecked={idx===0} />
                    <div className="p-3 text-center rounded-lg bg-gray-50 text-gray-500 border border-transparent peer-checked:bg-blue-50 peer-checked:text-blue-600 peer-checked:border-blue-200 peer-checked:font-bold transition-all text-sm">
                      {tone}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 생일 */}
            <div>
              <label htmlFor="birthday" className="block text-sm font-bold text-gray-700 mb-2">생일</label>
              <input type="date" id="birthday" className="w-full p-3 bg-gray-50 rounded-lg outline-none text-gray-700" />
            </div>

            {/* 이벤트 추가 */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="block text-sm font-bold text-gray-700">중요한 이벤트</span>
                  <p className="text-xs text-gray-400 mt-1">생일 외에 기념일을 추가하세요.</p>
                </div>
                <button type="button" onClick={addEvent} className="text-xs bg-gray-100 px-3 py-1.5 rounded text-gray-600 font-bold hover:bg-gray-200">
                  + 추가
                </button>
              </div>
              
              <div className="space-y-2">
                {events.map((evt) => (
                  <div key={evt.id} className="flex gap-2 p-2 bg-gray-50 rounded-lg items-center">
                    <input type="text" placeholder="예: 결혼기념일" className="flex-1 bg-transparent text-sm outline-none p-1" />
                    <input type="date" className="bg-transparent text-sm outline-none text-gray-500" />
                    <button type="button" onClick={() => removeEvent(evt.id)} className="text-gray-400 px-2 hover:text-red-500">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* 관심사 */}
            <div>
              <label htmlFor="interests" className="block text-sm font-bold text-gray-700 mb-2">관심사 / 취미</label>
              <textarea id="interests" rows={2} placeholder="예: 여행, 낚시..." className="w-full p-3 bg-gray-50 rounded-lg outline-none resize-none"></textarea>
            </div>

          </section>

          <section>
            <button type="submit" className="w-full bg-blue-600 text-white text-lg font-bold py-3.5 rounded-xl shadow hover:bg-blue-700 transition-colors">
              정보 저장하고 시작하기
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              나중에 마이페이지에서 수정할 수 있어요.
            </p>
          </section>

        </form>
      </main>
    </div>
  );
}