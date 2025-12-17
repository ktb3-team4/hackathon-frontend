"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type EventItem = {
  id: number;
  title: string;
  date: string;
};

export default function OnboardingPage() {
  const router = useRouter();

  const [tone, setTone] = useState<"casual" | "formal" | "cute" | "deep">(
    "casual"
  );
  const [events, setEvents] = useState<EventItem[]>([]);

  const handleAddEvent = () => {
    setEvents((prev) => [
      ...prev,
      { id: Date.now(), title: "", date: "" },
    ]);
  };

  const handleRemoveEvent = (id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleChangeEvent = (
    id: number,
    field: "title" | "date",
    value: string
  ) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // TODO: 백엔드에 대상자 정보 저장하는 API 호출 자리
    // const payload = { ... }
    // await fetch("/api/targets", { method: "POST", body: JSON.stringify(payload) })

    // 저장했다고 가정하고 홈으로 이동
    router.push("/");
  };

  return (
    <div className="app-frame">
      {/* 상단 바 */}
      <header className="app-bar app-bar-back">
        <button
          type="button"
          className="back-button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
        >
          ←
        </button>
        <h1 className="app-title">정보 등록</h1>
      </header>

      {/* 가운데 스크롤 영역 */}
      <main className="app-content">
        <form className="form" onSubmit={handleSubmit}>
          <section className="field-group">
            <h2 className="section-title-sm">대상자 정보</h2>

            {/* 이름 */}
            <label className="field-label" htmlFor="name">
              이름
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              placeholder="홍길동"
            />

            {/* 관계 */}
            <label className="field-label" htmlFor="relation">
              대상자와의 관계
            </label>
            <select id="relation" name="relation" className="input">
              <option>엄마</option>
              <option>아빠</option>
              <option>할머니</option>
              <option>할아버지</option>
              <option>기타</option>
            </select>

            {/* 연락처 */}
            <label className="field-label" htmlFor="phone">
              연락처
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input"
              placeholder="예: 010-1234-5678"
            />

            {/* 말투 선택 */}
            <p className="helper-text">
              어떤 말투가 이 분과 대화하기에 가장 편한가요?
            </p>
            <div className="tone-options">
              <label
                className={
                  "tone-option " +
                  (tone === "casual" ? "tone-option-selected" : "")
                }
              >
                <input
                  type="radio"
                  name="tone"
                  value="casual"
                  checked={tone === "casual"}
                  onChange={() => setTone("casual")}
                />
                <span>편한 반말</span>
              </label>
              <label
                className={
                  "tone-option " +
                  (tone === "formal" ? "tone-option-selected" : "")
                }
              >
                <input
                  type="radio"
                  name="tone"
                  value="formal"
                  checked={tone === "formal"}
                  onChange={() => setTone("formal")}
                />
                <span>존댓말</span>
              </label>
              <label
                className={
                  "tone-option " +
                  (tone === "cute" ? "tone-option-selected" : "")
                }
              >
                <input
                  type="radio"
                  name="tone"
                  value="cute"
                  checked={tone === "cute"}
                  onChange={() => setTone("cute")}
                />
                <span>애교 섞인 말투</span>
              </label>
              <label
                className={
                  "tone-option " +
                  (tone === "deep" ? "tone-option-selected" : "")
                }
              >
                <input
                  type="radio"
                  name="tone"
                  value="deep"
                  checked={tone === "deep"}
                  onChange={() => setTone("deep")}
                />
                <span>감성 진솔 모드</span>
              </label>
            </div>

            {/* 생일 */}
            <label className="field-label" htmlFor="birthday">
              생일
            </label>
            <input id="birthday" name="birthday" type="date" className="input" />

            {/* 중요한 이벤트 */}
            <div className="events-header">
              <div>
                <span className="field-label">중요한 이벤트</span>
                <p className="helper-text">
                  생일처럼 날짜와 제목(메인 텍스트)을 함께 추가해 주세요.
                </p>
              </div>
              <button
                type="button"
                id="add-event-btn"
                className="btn btn-small"
                onClick={handleAddEvent}
              >
                + 이벤트 추가
              </button>
            </div>

            <div id="events-list" className="events-list">
              {events.map((event) => (
                <div key={event.id} className="event-item">
                  <input
                    type="text"
                    className="input event-input"
                    placeholder="예: 결혼기념일, 부모님 만난 날"
                    value={event.title}
                    onChange={(e) =>
                      handleChangeEvent(event.id, "title", e.target.value)
                    }
                  />
                  <input
                    type="date"
                    className="input event-date-input"
                    value={event.date}
                    onChange={(e) =>
                      handleChangeEvent(event.id, "date", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="remove-event-btn"
                    onClick={() => handleRemoveEvent(event.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* 관심사 / 취미 */}
            <label className="field-label" htmlFor="interests">
              관심사 / 취미
            </label>
            <textarea
              id="interests"
              name="interests"
              className="textarea input-textarea"
              rows={2}
              placeholder="예: 여행, 낚시, 드라마, 음악..."
            />

            {/* 직업 */}
            <label className="field-label" htmlFor="job">
              직업
            </label>
            <input
              id="job"
              name="job"
              type="text"
              className="input"
              placeholder="현재 또는 예전 직업 / 하는 일"
            />
          </section>

          {/* 저장 버튼 영역 */}
          <section className="field-group">
            <button type="submit" className="btn btn-primary btn-full">
              정보 저장하고 시작하기
            </button>
            <p className="helper-text">
              나중에 마이페이지에서 대상자 정보를 다시 수정할 수 있어요.
            </p>
          </section>
        </form>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="bottom-nav">
        <button
          className="nav-item active"
          type="button"
          onClick={() => router.back()}
        >
          <img
            src="/images/icon_list.png"
            alt="뒤로가기"
            className="nav-icon-img"
          />
          <span className="nav-label">뒤로가기</span>
        </button>
        <button className="nav-item" type="button" onClick={() => router.push("/")}>
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
