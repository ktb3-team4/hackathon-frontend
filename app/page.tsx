"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// targets.html에 있던 데이터 그대로 사용
const TARGETS_DATA = [
  {
    id: 1,
    name: '엄마',
    lastContact: '3일 전',
    recommendation: '최근에 본 드라마나 영화 중에 기억에 남는 작품이 있어?',
  },
  {
    id: 2,
    name: '아빠',
    lastContact: '1주 전',
    recommendation: '요즘 가장 재미있게 보고 계신 뉴스나 취미가 있으세요?',
  },
  {
    id: 3,
    name: '할머니',
    lastContact: '2개월 전',
    recommendation: '요즘 어떻게 지내세요? 아프신 곳은 없죠?',
  },
  {
    id: 4,
    name: '지혜',
    lastContact: '5일 전',
    recommendation: '최근 프로젝트나 업무 중에 기억에 남는 순간이 있었어?',
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F2F4F6] flex flex-col max-w-md mx-auto shadow-xl relative font-sans text-gray-900">
      
      {/* === 상단 헤더 (targets.html: app-bar) === */}
      <header className="bg-white sticky top-0 z-50 px-4 h-[60px] flex items-center shadow-sm">
        <div className="flex items-center gap-2">
           {/* 로고 대신 텍스트나 이모지로 대체하여 깨짐 방지 */}
           <span className="text-2xl">👨‍👩‍👧‍👦</span>
           <h1 className="text-xl font-bold tracking-tight">두드림</h1>
        </div>
      </header>

      {/* === 메인 콘텐츠 === */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <section>
          <h2 className="text-sm font-bold text-gray-800 mb-3 px-1">소중한 사람 목록</h2>
          
          <div className="space-y-4">
            {TARGETS_DATA.map((item) => (
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

                {/* 내용 */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1 font-semibold">추천 메시지</p>
                  <p className="text-[15px] leading-relaxed text-gray-700">
                    {item.recommendation}
                  </p>
                </div>

                {/* 버튼들 */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={(e) => { e.stopPropagation(); alert('카카오톡 전송'); }}
                    className="flex-1 bg-[#FAE100] text-[#371D1E] text-sm font-bold py-2 rounded-lg hover:opacity-90"
                  >
                    카카오톡 전송
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); alert('전화하기'); }}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 text-sm font-bold py-2 rounded-lg hover:bg-gray-50"
                  >
                    전화하기
                  </button>
                </div>
              </article>
            ))}
          </div>

          <p className="text-center text-gray-400 mt-8 text-sm">
            더 이상 항목이 없어요.
          </p>
        </section>
      </main>

      {/* === 하단 내비게이션 바 (targets.html: bottom-nav) === */}
      {/* SVG 아이콘 절대 사용 안함. 이모지로 대체. */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center h-[70px] z-50 rounded-t-2xl pb-1">
        
        <button onClick={() => router.back()} className="flex flex-col items-center justify-center w-full h-full text-gray-400">
          <span className="text-2xl mb-1">👥</span>
          <span className="text-[11px] font-medium">뒤로가기</span>
        </button>

        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-blue-600">
          <span className="text-2xl mb-1">🏠</span>
          <span className="text-[11px] font-bold">홈</span>
        </Link>

        <button className="flex flex-col items-center justify-center w-full h-full text-gray-400">
          <span className="text-2xl mb-1">👤</span>
          <span className="text-[11px] font-medium">마이페이지</span>
        </button>
      </nav>
    </div>
  );
}