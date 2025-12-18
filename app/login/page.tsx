"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setTimeout(() => {
      window.location.href = kakaoLoginUrl as string;
    }, 300); // 짧은 지연 후 이동
  };

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <img src="/images/logo.png" alt="두드림" className="topbar-logo" />
            <h1 className="topbar-title">두드림</h1>
          </div>
          <div className="topbar-right-spacer" />
        </div>
      </header>

      <main className="app-content" style={{ padding: 16 }}>
        <section className="card home-top-card">
          <p className="section-caption">Dodream</p>
          <h2 className="home-greet-title">카카오로 시작하기</h2>
          <p className="home-greet-sub">
            로그인하면 대상자 정보와 이벤트를 안전하게 저장하고 이어서 사용할 수 있어요.
          </p>
        </section>

        <section
          className="card"
          style={{
            background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
            color: "#fff",
            border: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 24 }}>💌</span>
            <div>
              <p className="section-caption" style={{ color: "#c7bfff" }}>
                Kakao Login
              </p>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>3초 만에 시작</h3>
            </div>
          </div>
          <p style={{ margin: 0, color: "#e6e1ff", lineHeight: 1.5, fontSize: 14 }}>
            로그인 후 자동으로 홈으로 이동해요. 카카오 인증 창이 열리면 안내에 따라 진행해주세요.
          </p>
          <button
            onClick={handleLogin}
            className="btn kakao-btn btn-full"
            style={{ marginTop: 14, fontWeight: 800, display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", animation: "dots 1s steps(3, end) infinite" }}>
                  로그인 중...
                </span>
              </>
            ) : (
              "카카오 계정으로 계속하기"
            )}
          </button>
        </section>
      </main>
    </div>
  );
}
