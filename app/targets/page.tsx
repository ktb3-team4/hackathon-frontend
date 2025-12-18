"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureAccessToken } from "@/utils/auth";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

type TargetItem = {
  targetId: number;
  name: string;
  relationName?: string;
  relationId?: number;
  chatStyleId?: number;
  phoneNumber?: string | null;
};

type Relationship = {
  id: number;
  description: string;
};

type ChatStyle = {
  id: number;
  styleName: string;
};

export default function TargetsPage() {
  const router = useRouter();
  const [items, setItems] = useState<TargetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideHeader, setHideHeader] = useState(false);
  const contentRef = useRef<HTMLElement | null>(null);
  const [editing, setEditing] = useState<TargetItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    relationId: 1,
    chatStyleId: 1,
    phone: "",
  });
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [chatStyles, setChatStyles] = useState<ChatStyle[]>([]);

  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, ""),
    []
  );
  const apiPrefix = useMemo(() => {
    if (!apiBase) return "";
    const trimmed = apiBase.replace(/\/api\/?$/, "");
    return `${trimmed}/api`;
  }, [apiBase]);

  useEffect(() => {
    const fetchTargets = async () => {
      const token = await ensureAccessToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      if (!apiPrefix) {
        setError("API 주소가 설정되지 않았습니다.");
        setLoading(false);
        return;
      }
      try {
        const [targetsRes, relRes, styleRes] = await Promise.all([
          fetch(`${apiPrefix}/targets`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }),
          fetch(`${apiPrefix}/relationships`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }),
          fetch(`${apiPrefix}/chat-styles`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }),
        ]);

        if ([targetsRes, relRes, styleRes].some((r) => r.status === 401)) {
          router.replace("/login");
          return;
        }

        if (!targetsRes.ok) {
          const text = await targetsRes.text();
          throw new Error(text || "대상자 목록을 불러오지 못했습니다.");
        }
        if (relRes.ok) {
          const relJson = await relRes.json();
          if (Array.isArray(relJson?.data)) setRelationships(relJson.data);
        }
        if (styleRes.ok) {
          const styleJson = await styleRes.json();
          if (Array.isArray(styleJson?.data)) setChatStyles(styleJson.data);
        }

        const json = await targetsRes.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        setItems(list);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, [apiPrefix, router]);

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

  const cleanPhone = (input?: string | null) =>
    input ? input.replace(/[^0-9]/g, "") : undefined;

  const formatPhoneDisplay = (input?: string | null) => {
    const digits = (input || "").replace(/[^0-9]/g, "");
    if (!digits) return "";
    if (digits.length >= 11) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
    if (digits.length >= 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    if (digits.length >= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  const splitPhoneParts = (input?: string | null) => {
    const digits = (input || "").replace(/[^0-9]/g, "");
    const a = digits.slice(0, 3);
    const b = digits.slice(3, 7);
    const c = digits.slice(7, 11);
    return [a, b, c] as const;
  };

  const [p1, p2, p3] = splitPhoneParts(editForm.phone);

  const defaultRelationId = relationships[0]?.id || 1;
  const defaultChatStyleId = chatStyles[0]?.id || 1;

  const handleDelete = async (targetId: number) => {
    if (!apiPrefix) return;
    if (!confirm("이 대상자를 삭제하시겠습니까?")) return;
    const token = await ensureAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const res = await fetch(`${apiPrefix}/targets/${targetId}`, {
        method: "DELETE",
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
        throw new Error(text || "삭제에 실패했습니다.");
      }
      setItems((prev) => prev.filter((t) => t.targetId !== targetId));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.");
    }
  };

  const openEditModal = (target: TargetItem) => {
    setEditing(target);
    setEditForm({
      name: target.name,
      relationId: target.relationId || defaultRelationId,
      chatStyleId: target.chatStyleId || defaultChatStyleId,
      phone: formatPhoneDisplay(target.phoneNumber || ""),
    });
  };

  const submitEdit = async () => {
    if (!editing || !apiPrefix) return;
    const token = await ensureAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const payload = {
      name: editForm.name.trim(),
      relationshipId: Number(editForm.relationId) || 1,
      chatStyleId: Number(editForm.chatStyleId) || 1,
      phoneNumber: cleanPhone(editForm.phone),
      age: undefined,
      birthday: undefined,
      interests: undefined,
      events: [],
    };

    try {
      const res = await fetch(`${apiPrefix}/targets/${editing.targetId}`, {
        method: "PUT",
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
        throw new Error(text || "수정에 실패했습니다.");
      }
      setItems((prev) =>
        prev.map((t) =>
          t.targetId === editing.targetId
            ? {
                ...t,
                name: editForm.name.trim(),
                relationId: payload.relationshipId,
                chatStyleId: payload.chatStyleId,
                phoneNumber: payload.phoneNumber || null,
              }
            : t
        )
      );
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="app-frame">
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
        <section className="hero-card">
          <div className="hero-icon">👥</div>
          <div className="hero-body">
            <p className="section-caption">소중한 사람</p>
            <h2 className="hero-title">등록한 사람들을 확인하세요</h2>
            <p className="hero-subtitle">
              이름과 관계 정보를 한눈에 확인하고, 홈에서 바로 연락을 이어가요.
            </p>
          </div>
        </section>

        <section className="field-group">
          <h2 className="section-title-sm">소중한 사람 목록</h2>
          {loading && <p className="helper-text">불러오는 중...</p>}
          {error && (
            <p className="helper-text" style={{ color: "#ff8a7a" }}>
              {error}
            </p>
          )}
          <div className="targets-list">
            {items.map((item) => (
              <article key={item.targetId} className="target-card">
                <div className="target-head">
                  <div>
                    <p className="target-name">{item.name}</p>
                    {item.relationName && (
                      <p className="target-relation" style={{ marginTop: 2 }}>
                        {item.relationName}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="수정"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(item);
                      }}
                      style={{
                        background: "#f3f4f8",
                        borderRadius: "10px",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="삭제"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.targetId);
                      }}
                      style={{
                        background: "#fff0ee",
                        borderRadius: "10px",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#d1434b",
                      }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!loading && !items.length && !error && (
            <p className="helper-text">등록된 대상자가 없습니다.</p>
          )}
        </section>
      </main>

      {editing && (
        <div className="modal">
          <div className="modal-overlay" onClick={() => setEditing(null)} />
          <div
            className="modal-content"
            style={{
              maxWidth: 320,
              width: "88%",
              maxHeight: "68vh",
              overflowY: "auto",
              borderRadius: 20,
              padding: 12,
              boxShadow: "0 20px 50px rgba(15,23,42,0.22)",
              background: "linear-gradient(145deg, #ffffff, #f8f9fc)",
            }}
          >
            <div className="modal-header" style={{ display: "none" }}></div>
            <div
              className="modal-body"
              style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 4 }}
            >
              <label className="field-label" htmlFor="edit-name">
                이름
              </label>
              <input
                id="edit-name"
                className="input"
                style={{ height: 48, marginBottom: 6 }}
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />

              <label className="field-label" htmlFor="edit-relation">
                관계
              </label>
              <select
                id="edit-relation"
                className="input"
                style={{ height: 48, marginBottom: 6 }}
                value={editForm.relationId}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, relationId: Number(e.target.value) || defaultRelationId }))
                }
              >
                {relationships.map((rel) => (
                  <option key={rel.id} value={rel.id}>
                    {rel.description}
                  </option>
                ))}
              </select>

              <label className="field-label" htmlFor="edit-chatstyle">
                말투
              </label>
              <select
                id="edit-chatstyle"
                className="input"
                style={{ height: 48, marginBottom: 6 }}
                value={editForm.chatStyleId}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, chatStyleId: Number(e.target.value) || defaultChatStyleId }))
                }
              >
                {chatStyles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.styleName}
                  </option>
                ))}
              </select>

              <label className="field-label" htmlFor="edit-phone">
                전화번호
              </label>
              <div className="field-row" style={{ gap: 6, marginBottom: 4 }}>
                <input
                  type="tel"
                  className="input"
                  style={{ height: 48, marginBottom: 0 }}
                  placeholder="010"
                  value={p1}
                  onChange={(e) => {
                    const next = [
                      e.target.value.replace(/[^0-9]/g, ""),
                      p2,
                      p3,
                    ]
                      .filter((v) => v !== "")
                      .join("-");
                    setEditForm((prev) => ({ ...prev, phone: next }));
                  }}
                />
                <input
                  type="tel"
                  className="input"
                  style={{ height: 48, marginBottom: 0 }}
                  placeholder="1234"
                  value={p2}
                  onChange={(e) => {
                    const next = [
                      p1,
                      e.target.value.replace(/[^0-9]/g, ""),
                      p3,
                    ]
                      .filter((v) => v !== "")
                      .join("-");
                    setEditForm((prev) => ({ ...prev, phone: next }));
                  }}
                />
                <input
                  type="tel"
                  className="input"
                  style={{ height: 48, marginBottom: 0 }}
                  placeholder="5678"
                  value={p3}
                  onChange={(e) => {
                    const next = [
                      p1,
                      p2,
                      e.target.value.replace(/[^0-9]/g, ""),
                    ]
                      .filter((v) => v !== "")
                      .join("-");
                    setEditForm((prev) => ({ ...prev, phone: next }));
                  }}
                />
              </div>
            </div>
            <div
              className="modal-footer"
              style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setEditing(null)}
              >
                취소
              </button>
              <button type="button" className="btn btn-primary" onClick={submitEdit}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}

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
