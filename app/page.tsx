// app/page.tsx
"use client";

export default function LoginPage() {
  // C님이 주신 설정파일에 있던 주소 (나중에 C님 서버 켜지면 진짜 작동함)
  // 지금은 일단 버튼 누르면 온보딩으로 넘어가게 '임시 링크'를 걸어둘게요.
  
  const handleLogin = () => {
    // 실제 로그인 연동 전이므로, 바로 온보딩으로 이동시킵니다.
    // 나중에 이 부분을 window.location.href = "http://localhost:8080/..." 로 바꾸면 됨
    window.location.href = "/onboarding";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-yellow-50 p-6">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          👨‍👩‍👧‍👦 효도 메시지 생성기
        </h1>
        <p className="text-gray-600">
          로그인하고 부모님께 드릴 따뜻한 말을 만들어보세요.
        </p>
        
        {/* 카카오 로그인 버튼 디자인 */}
        <button 
          onClick={handleLogin}
          className="bg-[#FEE500] text-black w-full max-w-xs py-4 rounded-xl font-bold text-lg hover:bg-[#FDD835] transition-colors shadow-md"
        >
          카카오로 3초 만에 시작하기
        </button>
      </div>
    </main>
  );
}