"use client";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

type TokenLike =
  | string
  | { accessToken?: string }
  | { token?: string }
  | { data?: unknown }
  | { result?: unknown };

const extractTokenFromUnknown = (input: unknown): string | null => {
  if (!input || typeof input !== "object") return null;
  const maybeToken = (input as Record<string, unknown>).accessToken ?? (input as Record<string, unknown>).token;
  return typeof maybeToken === "string" ? maybeToken : null;
};

const pickAccessToken = (payload: TokenLike): string | null => {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  const direct = extractTokenFromUnknown(payload);
  if (direct) return direct;

  const data = (payload as { data?: unknown; result?: unknown }).data ?? (payload as { data?: unknown; result?: unknown }).result;
  if (!data) return null;
  if (typeof data === "string") return data;
  const nested = extractTokenFromUnknown(data);
  if (nested) return nested;
  return null;
};

export const getStoredAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const setStoredAccessToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
};

export const refreshAccessToken = async (): Promise<string> => {
  if (!API_BASE_URL) {
    throw new Error("API base URL이 설정되지 않았습니다.");
  }
  const existing = getStoredAccessToken();
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: existing ? { Authorization: `Bearer ${existing}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "토큰 재발급에 실패했습니다.");
  }

  const json = (await res.json()) as TokenLike;
  const token = pickAccessToken(json);
  if (!token) {
    throw new Error("응답에서 액세스 토큰을 찾지 못했습니다.");
  }
  setStoredAccessToken(token);
  return token;
};

export const ensureAccessToken = async (): Promise<string | null> => {
  const stored = getStoredAccessToken();
  if (stored) return stored;
  try {
    const refreshed = await refreshAccessToken();
    return refreshed;
  } catch (error) {
    console.error("[auth] refresh failed", error);
    return null;
  }
};
