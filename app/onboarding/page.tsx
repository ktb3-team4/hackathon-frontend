"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureAccessToken } from "@/utils/auth";

type EventItem = {
  id: number;
  title: string;
  date: string;
};

type Relationship = {
  id: number;
  description: string;
};

type ChatStyle = {
  id: number;
  styleName: string;
  description?: string;
};

type CaptureFile = {
  file: File;
  preview: string;
};

export default function OnboardingPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [name, setName] = useState("");
  const [relationId, setRelationId] = useState<number | null>(null);
  const [chatStyleId, setChatStyleId] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [interests, setInterests] = useState("");
  const [errors, setErrors] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [chatStyles, setChatStyles] = useState<ChatStyle[]>([]);
  const [captures, setCaptures] = useState<CaptureFile[]>([]);

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

  const isValid = useMemo(
    () =>
      name.trim().length > 0 &&
      relationId !== null &&
      chatStyleId !== null &&
      phone.trim().length > 0,
    [name, relationId, chatStyleId, phone]
  );

  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, ""),
    []
  );
  const apiPrefix = useMemo(() => {
    if (!apiBase) return "";
    const trimmed = apiBase.replace(/\/api\/?$/, "");
    return `${trimmed}/api`;
  }, [apiBase]);

  const handleCaptureUpload = (files: FileList | null) => {
    if (!files) return;
    const remain = 3 - captures.length;
    if (remain <= 0) return;
    const selected = Array.from(files).slice(0, remain);
    const withPreview: CaptureFile[] = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setCaptures((prev) => [...prev, ...withPreview].slice(0, 3));
  };

  const handleRemoveCapture = (preview: string) => {
    URL.revokeObjectURL(preview);
    setCaptures((prev) => prev.filter((c) => c.preview !== preview));
  };

  useEffect(
    () => () => {
      captures.forEach((c) => URL.revokeObjectURL(c.preview));
    },
    [captures]
  );

  useEffect(() => {
    const fetchData = async () => {
      const token = await ensureAccessToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      if (!apiPrefix) return;

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        const [relRes, styleRes] = await Promise.all([
          fetch(`${apiPrefix}/relationships`, {
            headers,
            credentials: "include",
          }),
          fetch(`${apiPrefix}/chat-styles`, {
            headers,
            credentials: "include",
          }),
        ]);

        if (relRes.status === 401 || styleRes.status === 401) {
          router.replace("/login");
          return;
        }

        if (relRes.ok) {
          const relJson = await relRes.json();
          if (Array.isArray(relJson?.data)) {
            setRelationships(relJson.data);
            if (relJson.data[0]) setRelationId(relJson.data[0].id);
          }
        }

        if (styleRes.ok) {
          const styleJson = await styleRes.json();
          if (Array.isArray(styleJson?.data)) {
            setChatStyles(styleJson.data);
            if (styleJson.data[0]) setChatStyleId(styleJson.data[0].id);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [apiBase, router]);

  const calculateAge = (dateStr: string): number | null => {
    if (!dateStr) return null;
    const today = new Date();
    const birth = new Date(dateStr);
    if (Number.isNaN(birth.getTime())) return null;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setErrors("이름과 관계는 필수입니다.");
      return;
    }
    setErrors(null);

    const submit = async () => {
      if (!apiPrefix) {
        setErrors("API 주소가 설정되지 않았습니다.");
        return;
      }
      const token = await ensureAccessToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      setSubmitting(true);
      try {
        let chatContent: string | undefined;
        if (captures.length > 0) {
          const formData = new FormData();
          captures.forEach((c) => formData.append("images", c.file));
          const uploadRes = await fetch(`${apiPrefix}/prompts/images`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: formData,
          });
          if (uploadRes.status === 401) {
            router.replace("/login");
            return;
          }
          if (!uploadRes.ok) {
            const text = await uploadRes.text();
            throw new Error(text || "대화 캡처 업로드에 실패했습니다.");
          }
          const uploadJson = await uploadRes.json();
          chatContent =
            (uploadJson?.data as string | undefined) ??
            (uploadJson?.message as string | undefined);
        }

        const payload = {
          name,
          relationshipId: relationId,
          chatStyleId,
          age: calculateAge(birthday),
          phoneNumber: phone ? phone.replace(/[^0-9]/g, "") : undefined,
          birthday: birthday || undefined,
          interests: interests || undefined,
          chatContent,
          events: events
            .filter((ev) => ev.title.trim() || ev.date)
            .map((ev) => ({
              description: ev.title.trim(),
              date: ev.date || undefined,
            })),
        };

        const res = await fetch(`${apiPrefix}/targets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "등록에 실패했습니다.");
        }

        router.push("/");
      } catch (error) {
        console.error(error);
        setErrors(
          error instanceof Error ? error.message : "오류가 발생했습니다."
        );
      } finally {
        setSubmitting(false);
      }
    };

    submit();
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
          &lt;
        </button>
        <h1 className="app-title">정보 등록</h1>
      </header>

      {/* 가운데 스크롤 영역 */}
      <main className="app-content" style={{ paddingTop: 96 }}>
        <form className="form" onSubmit={handleSubmit}>
          {/* 헤더 카드 */}
          <section className="hero-card">
            <div className="hero-icon">✨</div>
            <div className="hero-body">
              <p className="section-caption">Info Setup</p>
              <h2 className="hero-title">소중한 사람 정보를 저장하세요</h2>
              <p className="hero-subtitle">
                이름, 관계, 기념일을 기록해 두면 메시지를 더 따뜻하게 만들 수
                있어요.
              </p>
            </div>
          </section>

          <section
            className="card"
            style={{
              paddingTop: 18,
              paddingBottom: 18,
              paddingLeft: 20,
              paddingRight: 20,
              marginLeft: -6,
              marginRight: -6,
            }}
          >
            <h2 className="section-title-sm">대상자 정보</h2>

            {/* 이름 */}
            <div className="field-row" style={{ gap: 12 }}>
              <div className="field-col">
                <label className="field-label" htmlFor="name">
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field-col">
                <label className="field-label" htmlFor="relation">
                  관계
                </label>
                <select
                  id="relation"
                  name="relation"
                  className="input"
                  value={relationId ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRelationId(val ? Number(val) : null);
                  }}
                >
                  {relationId === null && (
                    <option value="">관계를 불러오는 중...</option>
                  )}
                  {relationships.map((rel) => (
                    <option key={rel.id} value={rel.id}>
                      {rel.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 연락처 */}
            <label className="field-label" htmlFor="phone">
              연락처
            </label>
            <div className="field-row">
              <input
                type="tel"
                className="input"
                placeholder="010"
                value={phone.split("-")[0] || ""}
                onChange={(e) => {
                  const next = [
                    e.target.value.replace(/[^0-9]/g, ""),
                    phone.split("-")[1] || "",
                    phone.split("-")[2] || "",
                  ]
                    .filter(Boolean)
                    .join("-");
                  setPhone(next);
                }}
              />
              <input
                type="tel"
                className="input"
                placeholder="1234"
                value={phone.split("-")[1] || ""}
                onChange={(e) => {
                  const next = [
                    phone.split("-")[0] || "",
                    e.target.value.replace(/[^0-9]/g, ""),
                    phone.split("-")[2] || "",
                  ]
                    .filter(Boolean)
                    .join("-");
                  setPhone(next);
                }}
              />
              <input
                type="tel"
                className="input"
                placeholder="5678"
                value={phone.split("-")[2] || ""}
                onChange={(e) => {
                  const next = [
                    phone.split("-")[0] || "",
                    phone.split("-")[1] || "",
                    e.target.value.replace(/[^0-9]/g, ""),
                  ]
                    .filter(Boolean)
                    .join("-");
                  setPhone(next);
                }}
              />
            </div>

            <label className="field-label" htmlFor="birthday">
              생일
            </label>
            <input
              id="birthday"
              name="birthday"
              type="date"
              className="input"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />

            {/* 말투 선택 */}
            <p className="helper-text">
              어떤 말투가 이 분과 대화하기에 가장 편한가요?
            </p>
            <div className="tone-options">
              {chatStyles.map((style) => (
                <label
                  key={style.id}
                  className={
                    "tone-option " +
                    (chatStyleId === style.id ? "tone-option-selected" : "")
                  }
                >
                  <input
                    type="radio"
                    name="tone"
                    value={style.id}
                    checked={chatStyleId === style.id}
                    onChange={() => setChatStyleId(style.id)}
                  />
                  <span>{style.styleName}</span>
                </label>
              ))}
            </div>

            {/* 대화 캡처 업로드 (선택, 최대 3장) */}
            <input
              id="capture"
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleCaptureUpload(e.target.files)}
            />
            <label
              htmlFor="capture"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "14px 16px",
                border: "1px dashed #e5e7eb",
                borderRadius: 14,
                background: "#f9fafb",
                cursor: "pointer",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>
                  대화 캡처 추가 (최대 3장)
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
                  이미지 파일을 선택해 업로드하세요.
                </p>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#ff8a7a",
                  background: "#fff3ef",
                  padding: "6px 10px",
                  borderRadius: 999,
                }}
              >
                {captures.length}/3
              </span>
            </label>
            {captures.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 8,
                  marginBottom: 6,
                }}
              >
                {captures.map((item) => (
                  <div
                    key={item.preview}
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 12,
                      overflow: "hidden",
                      position: "relative",
                      border: "1px solid #e5e7eb",
                      background: "#f3f4f6",
                    }}
                  >
                    <img
                      src={item.preview}
                      alt="capture preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCapture(item.preview)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "rgba(0,0,0,0.55)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 중요한 이벤트 */}
            <div className="events-header">
              <span className="field-label">중요한 이벤트</span>
              <button
                type="button"
                id="add-event-btn"
                className="btn btn-primary btn-small"
                onClick={handleAddEvent}
              >
                + 이벤트 추가
              </button>
            </div>

            <div id="events-list" className="events-list">
              {events.length === 0 && (
                <p className="helper-text">
                  등록된 이벤트가 없어요. 추가 버튼으로 기념일을 넣어보세요.
                </p>
              )}
              {events.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="field-col">
                    <input
                      type="text"
                      className="input event-input"
                      placeholder="예: 결혼기념일"
                      value={event.title}
                      onChange={(e) =>
                        handleChangeEvent(event.id, "title", e.target.value)
                      }
                    />
                  </div>
                  <div className="field-col" style={{ maxWidth: 160 }}>
                    <input
                      type="date"
                      className="input event-date-input"
                      value={event.date}
                      onChange={(e) =>
                        handleChangeEvent(event.id, "date", e.target.value)
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="remove-event-btn"
                    onClick={() => handleRemoveEvent(event.id)}
                    aria-label="이 이벤트 삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* 관심사 / 취미 */}
            <div style={{ height: 8 }} />
            <label className="field-label" htmlFor="interests">
              관심사 / 취미
            </label>
            <textarea
              id="interests"
              name="interests"
              className="textarea input-textarea"
              rows={2}
              placeholder="예: 여행, 낚시, 드라마, 음악..."
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
            {/* 저장 버튼 영역 */}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submitting || !isValid}
              >
                정보 저장하고 시작하기
              </button>
              {errors && (
                <p className="helper-text" style={{ color: "#ff8a7a" }}>
                  {errors}
                </p>
              )}
              <p className="helper-text" style={{ textAlign: "center" }}>
                나중에 정보를 다시 수정할 수 있어요.
              </p>
            </div>
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
        <button
          className="nav-item"
          type="button"
          onClick={() => router.push("/")}
        >
          <img src="/images/icon_home.png" alt="홈" className="nav-icon-img" />
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

      {submitting && (
        <div
          className="loading-overlay"
          role="alert"
          aria-live="assertive"
          aria-busy="true"
        >
          <div className="loading-card">
            <div className="loading-wave" />
            <p className="loading-title">소중한 정보를 정리하고 있어요</p>
            <p className="loading-sub">대화 기록을 살펴서 맞춤 메시지를 만들고 있습니다.</p>
            <div className="loading-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
