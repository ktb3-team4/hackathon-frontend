"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function MyPage() {
  const router = useRouter();
  const [hideHeader, setHideHeader] = useState(false);
  const contentRef = useRef<HTMLElement | null>(null);

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

  return (
    <div className="app-frame">
      {/* ✅ 홈/목록과 동일한 "큰" 상단바 */}
      <header className={`topbar ${hideHeader ? "is-hidden" : ""}`}>
        <div className="topbar-inner">
          <div className="topbar-left">
            <img src="/images/logo.png" alt="두드림" className="topbar-logo" />
            <h1 className="topbar-title">두드림</h1>
          </div>

          <div className="topbar-right-spacer" />
        </div>
      </header>

      {/* 가운데 스크롤 영역 */}
      <main className="app-content" ref={contentRef}>
        <section className="field-group no-border">
          {/* 사용자 정보 */}
          <section className="card">
            <div className="user-info-row">
              <div className="user-avatar">
                <span className="avatar-icon">💬</span>
              </div>

              <div className="user-name-wrapper">
                <p className="user-name">ella</p>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={() => {
                  alert("로그아웃(데모)");
                }}
              >
                로그아웃
              </button>
            </div>
          </section>

          {/* 메뉴 리스트 */}
          <section className="card">
            <button
              type="button"
              className="menu-item"
              onClick={() => alert("문의하기(데모)")}
            >
              <span className="menu-text">문의하기</span>
              <span className="menu-arrow">→</span>
            </button>

            <button
              type="button"
              className="menu-item"
              onClick={() => alert("이용약관(데모)")}
            >
              <span className="menu-text">서비스 이용약관</span>
              <span className="menu-arrow">→</span>
            </button>

            <button
              type="button"
              className="menu-item"
              onClick={() => alert("개인정보(데모)")}
            >
              <span className="menu-text">개인정보 처리방침</span>
              <span className="menu-arrow">→</span>
            </button>
          </section>

          {/* 회원 탈퇴 */}
          <div className="withdraw-section">
            <button
              type="button"
              className="withdraw-link"
              onClick={() => alert("회원 탈퇴(데모)")}
            >
              회원 탈퇴하기
            </button>
          </div>
        </section>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="bottom-nav">
        <button
          className="nav-item"
          type="button"
          onClick={() => router.push("/targets")}
        >
          <img src="/images/icon_list.png" alt="목록" className="nav-icon-img" />
          <span className="nav-label">목록</span>
        </button>

        <button
          className="nav-item"
          type="button"
          onClick={() => router.push("/")}
        >
          <img src="/images/icon_home.png" alt="홈" className="nav-icon-img" />
          <span className="nav-label">홈</span>
        </button>

        <button
          className="nav-item active"
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
