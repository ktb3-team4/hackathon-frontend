"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type EventItem = {
  id: number;
  title: string;
  date: string;
};

type Target = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  tone: "casual" | "formal" | "cute" | "deep";
  birthday: string;
  events: { title: string; date: string }[];
  interests: string;
  job: string;
};

const LS_TARGETS = "targets";
const LS_EDITING = "editingTarget";

function safeParse<T>(v: string | null, fallback: T): T {
  try {
    if (!v) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function makeId() {
  return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = useMemo(
    () => searchParams.get("edit") === "true",
    [searchParams]
  );

  const [targetId, setTargetId] = useState("");

  const [name, setName] = useState("");
  const [relation, setRelation] = useState("엄마");
  const [phone, setPhone] = useState("");
  const [tone, setTone] =
    useState<"casual" | "formal" | "cute" | "deep">("casual");
  const [birthday, setBirthday] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [interests, setInterests] = useState("");
  const [job, setJob] = useState("");

  /* 수정 모드면 값 채우기 */
  useEffect(() => {
    const editing = safeParse<Partial<Target>>(
      localStorage.getItem(LS_EDITING),
      {}
    );

    if (isEditMode && editing.id) {
      setTargetId(editing.id);
      setName(editing.name ?? "");
      setRelation(editing.relation ?? "엄마");
      setPhone(editing.phone ?? "");
      setTone((editing.tone as any) ?? "casual");
      setBirthday(editing.birthday ?? "");
      setInterests(editing.interests ?? "");
      setJob(editing.job ?? "");
      setEvents(
        (editing.events ?? []).map((e, idx) => ({
          id: Date.now() + idx,
          title: e.title,
          date: e.date,
        }))
      );
    }
  }, [isEditMode]);

  const handleAddEvent = () => {
    setEvents((prev) => [...prev, { id: Date.now(), title: "", date: "" }]);
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

    if (!name.trim()) {
      alert("이름을 입력해 주세요!");
      return;
    }

    const payload: Target = {
      id: targetId || makeId(),
      name: name.trim(),
      relation,
      phone: phone.trim(),
      tone,
      birthday,
      events: events
        .filter((e) => e.title || e.date)
        .map((e) => ({ title: e.title, date: e.date })),
      interests: interests.trim(),
      job: job.trim(),
    };

    const list = safeParse<Target[]>(localStorage.getItem(LS_TARGETS), []);
    const next =
      isEditMode && targetId
        ? list.map((t) => (t.id === payload.id ? payload : t))
        : [payload, ...list];

    localStorage.setItem(LS_TARGETS, JSON.stringify(next));
    localStorage.removeItem(LS_EDITING);

    router.push("/targets");
  };

  return (
    <div className="app-frame">
      {/* ✅ 홈/목록과 동일한 "큰" 상단바 */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <button
              type="button"
              className="back-button"
              onClick={() => router.back()}
            >
              ←
            </button>
            <h1 className="topbar-title">
              {isEditMode ? "정보 수정" : "정보 등록"}
            </h1>
          </div>

          <div className="topbar-right-spacer" />
        </div>
      </header>

      {/* 가운데 스크롤 */}
      <main className="app-content">
        <form className="form" onSubmit={handleSubmit}>
          <section className="field-group">
            <h2 className="section-title-sm">대상자 정보</h2>

            <label className="field-label">이름</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="field-label">관계</label>
            <select
              className="input"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
            >
              <option>엄마</option>
              <option>아빠</option>
              <option>할머니</option>
              <option>할아버지</option>
              <option>기타</option>
            </select>

            <label className="field-label">연락처</label>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <p className="helper-text">편한 말투를 선택해 주세요</p>
            <div className="tone-options">
              {[
                ["casual", "편한 반말"],
                ["formal", "존댓말"],
                ["cute", "애교 섞인 말투"],
                ["deep", "감성 진솔 모드"],
              ].map(([v, label]) => (
                <label
                  key={v}
                  className={`tone-option ${
                    tone === v ? "tone-option-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    checked={tone === v}
                    onChange={() => setTone(v as any)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <label className="field-label">생일</label>
            <input
              type="date"
              className="input"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />

            <div className="events-header">
              <span className="field-label">중요한 이벤트</span>
              <button
                type="button"
                className="btn btn-small"
                onClick={handleAddEvent}
              >
                + 이벤트 추가
              </button>
            </div>

            <div className="events-list">
              {events.map((event) => (
                <div key={event.id} className="event-item">
                  <input
                    className="input event-input"
                    placeholder="제목"
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

            <label className="field-label">관심사 / 취미</label>
            <textarea
              className="textarea input-textarea"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />

            <label className="field-label">직업</label>
            <input
              className="input"
              value={job}
              onChange={(e) => setJob(e.target.value)}
            />
          </section>

          <section className="field-group">
            <button type="submit" className="btn btn-primary btn-full">
              {isEditMode ? "수정 저장하기" : "정보 저장하고 시작하기"}
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}
