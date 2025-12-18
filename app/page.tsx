"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendKakaoMessage } from "@/utils/kakao";
import { ensureAccessToken } from "@/utils/auth";

type Target = {
  id: number;
  name: string;
  lastContact: string;
  relation: string;
  recommendation: string;
  phone: string;
};

const MOCK_TARGETS: Target[] = [
  {
    id: 1,
    name: "엄마",
    lastContact: "3일 전",
    relation: "엄마",
    recommendation: "최근에 본 드라마나 영화 중에 기억에 남는 작품이 있어?",
    phone: "01012345678",
  },
  {
    id: 2,
    name: "아빠",
    lastContact: "1주 전",
    relation: "아빠",
    recommendation: "요즘 가장 재미있게 보고 계신 뉴스나 취미가 있으세요?",
    phone: "01023456789",
  },
  {
    id: 3,
    name: "할머니",
    lastContact: "2개월 전",
    relation: "할머니",
    recommendation: "요즘 어떻게 지내세요? 아프신 곳은 없죠?",
    phone: "01034567890",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const token = await ensureAccessToken();
      if (!token) {
        router.replace("/login");
        setHasToken(false);
        return;
      }
      setHasToken(true);
    };
    check();
  }, [router]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSendKakao = (target: Target) => {
    sendKakaoMessage(target.recommendation);
  };

  return (
    <>
      {hasToken ? (
    <div className="app-frame">
      {/* 상단 헤더 */}
      <header className="app-bar">
        <div className="app-bar-left">
          <h1 className="app-title">대상자 목록</h1>
        </div>
      </header>

      <main className="app-content">
        {/* 상단 소개 카드 */}
        <section className="hero-card">
          <div className="hero-icon">💌</div>
          <div className="hero-body">
            <p className="section-caption">따뜻한 시작</p>
            <h2 className="hero-title">등록한 대상자에게 첫 메시지 보내기</h2>
            <p className="hero-subtitle">
              부모님이나 오랜만에 연락하는 친구를 선택하면 어울리는 질문을 불러와요.
            </p>
          </div>
        </section>

        {/* 대상자 목록 */}
        <section className="field-group">
          <h2 className="section-title-sm">대상자 목록</h2>
          <div className="targets-list">
            {MOCK_TARGETS.map((item) => (
              <article
                key={item.id}
                className="target-card"
                onClick={() => alert(`${item.name}님 상세 모달 (기능 준비중)`)}
              >
                <div className="target-head">
                  <div>
                    <p className="target-name">{item.name}</p>
                    <p className="target-relation">{item.relation}</p>
                  </div>
                  <div className="badge badge-soft">마지막 연락 {item.lastContact}</div>
                </div>

                <div className="target-body">
                  <p className="target-reco">{item.recommendation}</p>
                </div>

                <div className="target-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendKakao(item);
                    }}
                  >
                    카카오톡으로 전송하기
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
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
      <nav className="bottom-nav">
        <button
          type="button"
          className="nav-item"
          onClick={() => router.push("/onboarding")}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-label">대상자</span>
        </button>
        <button
          type="button"
          className="nav-item active"
          onClick={() => router.push("/")}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">홈</span>
        </button>
        <button
          type="button"
          className="nav-item"
          onClick={() => router.push("/mypage")}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">마이페이지</span>
        </button>
      </nav>
    </div>
      ) : hasToken === null ? (
        <div className="app-frame">
          <main className="app-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p className="helper-text">로그인 상태를 확인 중입니다...</p>
          </main>
        </div>
      ) : null}
    </>
  );
}
