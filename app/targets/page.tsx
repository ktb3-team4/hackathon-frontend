"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "../components/TopBar";

type TargetEvent = { title: string; date: string };

type Target = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  tone: "casual" | "formal" | "cute" | "deep";
  birthday: string;
  events: TargetEvent[];
  interests: string;
  job: string;
  lastContact?: string;
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

function toneLabel(t: Target["tone"]) {
  if (t === "casual") return "편한 반말";
  if (t === "formal") return "존댓말";
  if (t === "cute") return "애교 섞인 말투";
  return "감성 진솔 모드";
}

function formatBirthday(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function formatEvents(events?: TargetEvent[]) {
  if (!events || events.length === 0) return "";
  return events
    .map((e) => {
      const d = new Date(e.date);
      const mmdd = Number.isNaN(d.getTime())
        ? e.date
        : `${d.getMonth() + 1}월 ${d.getDate()}일`;
      return `${e.title} (${mmdd})`;
    })
    .join(", ");
}

export default function TargetsPage() {
  const router = useRouter();

  const [all, setAll] = useState<Target[]>([]);
  const [visible, setVisible] = useState<Target[]>([]);
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Target | null>(null);

  const contentRef = useRef<HTMLElement | null>(null);
  const pageSize = 6;

  const loadFromStorage = () => {
    const list = safeParse<Target[]>(localStorage.getItem(LS_TARGETS), []);
    setAll(list);
    setVisible(list.slice(0, pageSize));
    setEnd(list.length <= pageSize);
  };

  useEffect(() => {
    loadFromStorage();

    const onFocus = () => loadFromStorage();
    window.addEventListener("focus", onFocus);

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_TARGETS) loadFromStorage();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const loadMore = () => {
    if (loading || end) return;
    setLoading(true);

    setTimeout(() => {
      setVisible((prev) => {
        const next = all.slice(prev.length, prev.length + pageSize);
        const merged = [...prev, ...next];
        if (merged.length >= all.length) setEnd(true);
        return merged;
      });
      setLoading(false);
    }, 150);
  };

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 120;
      if (nearBottom) loadMore();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, end, loading]);

  const openModal = (item: Target) => {
    setCurrent(item);
    setOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setOpen(false);
    setCurrent(null);
    document.body.style.overflow = "";
  };

  const onEdit = () => {
    if (!current) return;
    localStorage.setItem(LS_EDITING, JSON.stringify(current));
    router.push("/onboarding?edit=true");
  };

  const onAdd = () => {
    localStorage.removeItem(LS_EDITING);
    router.push("/onboarding");
  };

  const empty = useMemo(() => all.length === 0, [all.length]);

  return (
    <div className="app-frame">
      {/* ✅ 공통 상단바: 로고+두드림 / 오른쪽 + */}
      <TopBar showAdd onAddClick={onAdd} />

      {/* 가운데 스크롤 */}
      <main className="app-content" ref={(n) => (contentRef.current = n)}>
        <section className="field-group">
          <h2 className="section-title-sm">등록한 대상자 목록</h2>

          {empty ? (
            <div className="card" style={{ marginTop: 12 }}>
              <p className="card-title">아직 등록된 대상자가 없어요</p>
              <p className="card-body-text">
                오른쪽 상단 + 버튼으로 먼저 추가해보자!
              </p>
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={onAdd}
                >
                  대상자 추가하기
                </button>
              </div>
            </div>
          ) : (
            <div className="targets-list" style={{ marginTop: 12 }}>
              {visible.map((item) => (
                <article
                  key={item.id}
                  className="target-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => openModal(item)}
                >
                  <div className="target-head">
                    <div>
                      <p className="target-name">{item.name}</p>
                      <p className="target-relation">{item.relation}</p>
                    </div>

                    <span className="badge badge-soft">상세 보기</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {loading && <p className="helper-text">불러오는 중...</p>}
          {!loading && !empty && end && (
            <p className="helper-text">더 이상 항목이 없어요.</p>
          )}
        </section>
      </main>

      {/* 상세 모달 */}
      {open && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-overlay" onClick={closeModal} />
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {current ? `${current.name} (${current.relation})` : "상세 정보"}
              </h2>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="btn btn-outline btn-small" onClick={onEdit}>
                  수정
                </button>
                <button className="modal-close" onClick={closeModal} aria-label="닫기">
                  ✕
                </button>
              </div>
            </div>

            <div className="modal-body">
              {current ? (
                <div className="target-info">
                  <p className="target-info-item">
                    <span className="target-info-label">연락처:</span>{" "}
                    {current.phone || "-"}
                  </p>
                  <p className="target-info-item">
                    <span className="target-info-label">말투:</span>{" "}
                    {toneLabel(current.tone)}
                  </p>
                  <p className="target-info-item">
                    <span className="target-info-label">생일:</span>{" "}
                    {current.birthday ? formatBirthday(current.birthday) : "-"}
                  </p>

                  <p className="target-info-item">
                    <span className="target-info-label">중요한 이벤트:</span>{" "}
                    {current.events?.length ? formatEvents(current.events) : "-"}
                  </p>

                  <p className="target-info-item">
                    <span className="target-info-label">관심사 / 취미:</span>{" "}
                    {current.interests || "-"}
                  </p>

                  <p className="target-info-item">
                    <span className="target-info-label">직업:</span>{" "}
                    {current.job || "-"}
                  </p>
                </div>
              ) : (
                <p className="target-info-item">등록된 정보가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 */}
      <nav className="bottom-nav">
        <button
          className="nav-item active"
          type="button"
          onClick={() => router.push("/targets")}
        >
          <img src="/images/icon_list.png" alt="목록" className="nav-icon-img" />
          <span className="nav-label">목록</span>
        </button>

        <button className="nav-item" type="button" onClick={() => router.push("/")}>
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
    </div>
  );
}
