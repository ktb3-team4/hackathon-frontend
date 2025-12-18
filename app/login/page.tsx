"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";

export default function LoginPage() {
  const router = useRouter();

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
    window.location.href = kakaoLoginUrl;
  };

  return (
    <div className="app-frame" style={{ background: "linear-gradient(to bottom, #fdf7ee 0%, #f4f6fb 60%, #eef2f8 100%)" }}>
      <header className="app-bar">
        <div className="app-bar-left">
          <h1 className="app-title">로그인</h1>
        </div>
        <button
          type="button"
          className="back-button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
        >
          &lt;
        </button>
      </header>

      <main className="app-content">
        <section className="card home-top-card">
          <p className="section-caption">Dodream</p>
          <h2 className="home-greet-title">카카오로 시작하기</h2>
          <p className="home-greet-sub">
            로그인하면 대상자 정보와 이벤트를 안전하게 저장하고 이어서 사용할 수 있어요.
          </p>
        </section>

        <section className="card" style={{ background: "linear-gradient(135deg, #1f1a2e 0%, #332b4d 100%)", color: "#fff", border: "none" }}>
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
            style={{ marginTop: 14, fontWeight: 800 }}
          >
            카카오 계정으로 계속하기
          </button>
        </section>

        <section className="card">
          <h3 className="section-title-sm">로그인 안내</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#555", lineHeight: 1.6, fontSize: 14 }}>
            <li>Refresh Token은 HttpOnly 쿠키로 저장돼요.</li>
            <li>Access Token은 자동으로 저장되어 요청에 사용됩니다.</li>
            <li>로그인 실패 시 다시 시도하거나 카카오 계정 상태를 확인해 주세요.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
