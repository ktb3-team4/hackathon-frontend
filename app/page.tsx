"use client";

import { useRouter } from "next/navigation";

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
    recommendation:
      "요즘 가장 재미있게 보고 계신 뉴스나 취미가 있으세요?",
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
    // 모바일에서 전화 앱 열기
    window.location.href = `tel:${phone}`;
  };

  const handleSendKakao = (target: Target) => {
    // TODO: 여기서 카카오톡 전송 함수 연결
    // 예: sendKakaoMessage(target, target.recommendation);
    console.log("카카오톡 전송", target);
  };

  return (
    <div className="app-frame">
      {/* 상단 바 */}
      <header className="app-bar">
        <div className="app-bar-left">
          <img
            src="/images/logo.png"
            alt="두드림"
            className="app-title-logo"
          />
          <h1 className="app-title">두드림</h1>
        </div>
      </header>

      {/* 가운데 스크롤 영역 */}
      <main className="app-content">
        <section className="field-group">
          <h2 className="section-title-sm">소중한 사람 목록</h2>

          <div className="targets-list">
            {MOCK_TARGETS.map((item) => (
              <article key={item.id} className="target-card">
                {/* 카드 헤더 */}
                <div className="target-head">
                  <div>
                    <p className="target-name">{item.name}</p>
                  </div>
                  <div className="badge badge-soft">
                    마지막 연락 · {item.lastContact}
                  </div>
                </div>

                {/* 추천 메시지 영역 */}
                <div className="target-body">
                  <p className="target-label">추천 메시지</p>
                  <p className="target-reco">{item.recommendation}</p>
                </div>

                {/* 버튼 영역 */}
                <div className="target-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-small"
                    onClick={() => handleSendKakao(item)}
                  >
                    카카오톡으로 전송하기
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    onClick={() => handleCall(item.phone)}
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
      <nav className="bottom-nav">
        <button
          className="nav-item"
          type="button"
          onClick={() => router.push("/onboarding")}
        >
          <img
            src="/images/icon_list.png"
            alt="대상자"
            className="nav-icon-img"
          />
          <span className="nav-label">대상자</span>
        </button>

        <button
          className="nav-item active"
          type="button"
          onClick={() => router.push("/")}
        >
          <img
            src="/images/icon_home.png"
            alt="홈"
            className="nav-icon-img"
          />
          <span className="nav-label">홈</span>
        </button>

        <button
          className="nav-item"
          type="button"
          onClick={() => router.push("/mypage")}
        >
          <img
            src="/images/icon_settings.png"
            alt="마이페이지"
            className="nav-icon-img"
          />
          <span className="nav-label">마이페이지</span>
        </button>
      </nav>
    </div>
  );
}
