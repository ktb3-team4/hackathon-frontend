"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendKakaoMessage } from "@/utils/kakao";
import { ensureAccessToken } from "@/utils/auth";

type Target = {
  id: number;
  name: string;
  lastContact: string;
  recommendation: string;
  phone?: string | null;
};

export default function HomePage() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideHeader, setHideHeader] = useState(false);
  const contentRef = useRef<HTMLElement | null>(null);

  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, ""),
    []
  );
  const apiPrefix = useMemo(() => {
    if (!apiBase) return "";
    const trimmed = apiBase.replace(/\/api\/?$/, "");
    return `${trimmed}/api`;
  }, [apiBase]);

  const formatLastContact = (dateStr?: string | null) => {
    if (!dateStr) return "기록 없음";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "기록 없음";
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff <= 0) return "오늘";
    return `${diff}일 전`;
  };

  useEffect(() => {
    const check = async () => {
      const token = await ensureAccessToken();
      if (!token) {
        router.replace("/login");
        setHasToken(false);
        return;
      }
      setHasToken(true);
      if (!apiPrefix) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiPrefix}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "대상자 목록을 불러오지 못했습니다.");
        }

        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        const mapped: Target[] = list.map((item: any) => ({
          id: item.targetId,
          name: item.name,
          lastContact: formatLastContact(item.lastMessageDate),
          recommendation:
            item.recommendedOpening || "추천 메시지를 준비 중입니다.",
          phone: item.phoneNumber || null,
        }));
        setTargets(mapped);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [router, apiPrefix]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
      setHideHeader(atBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const handleCall = (phone?: string | null) => {
    if (!phone) {
      alert("등록된 전화번호가 없습니다.");
      return;
    }
    const digits = phone.replace(/[^0-9]/g, "");
    if (!digits) {
      alert("유효한 전화번호가 없습니다.");
      return;
    }
    window.location.href = `tel:${digits}`;
  };

  const handleSendKakao = (target: Target) => {
    sendKakaoMessage(target.recommendation);
    updateLastMessageDate(target.id);
  };

  const updateLastMessageDate = async (targetId: number) => {
    if (!apiPrefix) return;
    const token = await ensureAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const res = await fetch(`${apiPrefix}/targets/${targetId}/message-date`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        console.error("최근 메시지 날짜 갱신 실패", await res.text());
        return;
      }
      setTargets((prev) =>
        prev.map((t) =>
          t.id === targetId ? { ...t, lastContact: "오늘" } : t
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {hasToken ? (
        <div className="app-frame">
          {/* 상단 헤더 - 마이페이지 헤더와 동일 스타일 */}
          <header className={`topbar ${hideHeader ? "is-hidden" : ""}`}>
            <div className="topbar-inner">
              <div className="topbar-left">
                <img src="/images/logo.png" alt="두드림" className="topbar-logo" />
                <h1 className="topbar-title">두드림</h1>
              </div>
              <div className="topbar-right-spacer" />
            </div>
          </header>

          <main className="app-content" ref={contentRef}>
            {/* 상단 소개 카드 */}
            <section className="hero-card">
              <div className="hero-icon">💌</div>
              <div className="hero-body">
                <p className="section-caption">따뜻한 시작</p>
                <h2 className="hero-title">소중한 사람에게 첫 메시지 보내기</h2>
                <p className="hero-subtitle">
                  오랜만에 연락하는 부모님께 어울리는 인사말을 추천해드려요.
                </p>
              </div>
            </section>

            {/* 대상자 목록 */}
            <section className="field-group">
              <h2 className="section-title-sm">소중한 사람 목록</h2>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -4, marginBottom: 8 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-small"
                  onClick={() => router.push("/onboarding")}
                >
                  + 소중한 사람 추가
                </button>
              </div>
              {loading && <p className="helper-text">불러오는 중...</p>}
              {error && (
                <p className="helper-text" style={{ color: "#ff8a7a" }}>
                  {error}
                </p>
              )}
              <div className="targets-list">
                {targets.map((item) => (
                  <article
                    key={item.id}
                    className="target-card"
                    onClick={() =>
                      alert(`${item.name}님 상세 모달 (기능 준비중)`)
                    }
                  >
                    <div className="target-head">
                      <div>
                        <p className="target-name">{item.name}</p>
                      </div>
                      <div className="badge badge-soft">
                        마지막 연락 {item.lastContact}
                      </div>
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
                        style={{
                          opacity: item.phone ? 1 : 0.6,
                          cursor: item.phone ? "pointer" : "not-allowed",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCall(item.phone);
                          updateLastMessageDate(item.id);
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
              onClick={() => router.push("/targets")}
            >
              <img src="/images/icon_list.png" alt="목록" className="nav-icon-img" />
              <span className="nav-label">목록</span>
            </button>
            <button
              type="button"
              className="nav-item active"
              onClick={() => router.push("/")}
            >
              <img src="/images/icon_home.png" alt="홈" className="nav-icon-img" />
              <span className="nav-label">홈</span>
            </button>
            <button
              type="button"
              className="nav-item"
              onClick={() => router.push("/mypage")}
            >
              <img src="/images/icon_settings.png" alt="마이페이지" className="nav-icon-img" />
              <span className="nav-label">마이페이지</span>
            </button>
          </nav>
        </div>
      ) : hasToken === null ? (
        <div className="app-frame">
          <main
            className="app-content"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p className="helper-text">로그인 상태를 확인 중입니다...</p>
          </main>
        </div>
      ) : null}
    </>
  );
}
