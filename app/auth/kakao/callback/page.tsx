"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ApiResult<T> = {
  data?: T;
  result?: T;
  success?: boolean;
  message?: string;
};

type TokenLike =
  | string
  | { accessToken?: string }
  | { token?: string }
  | { data?: unknown }
  | { result?: unknown };

const pickAccessToken = (
  payload: TokenLike | null | undefined
): string | null => {
  if (!payload) return null;
  if (typeof payload === "string") return payload;

  const maybeDirect =
    (payload as { accessToken?: unknown }).accessToken ??
    (payload as { token?: unknown }).token;
  if (typeof maybeDirect === "string") return maybeDirect;

  const nested =
    (payload as { data?: unknown }).data ??
    (payload as { result?: unknown }).result;
  if (!nested) return null;
  if (typeof nested === "string") return nested;

  const nestedObjToken =
    (nested as { accessToken?: unknown }).accessToken ??
    (nested as { token?: unknown }).token;
  return typeof nestedObjToken === "string" ? nestedObjToken : null;
};

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const apiPrefix = useMemo(() => {
    if (!apiBaseUrl) return "";
    const trimmed = apiBaseUrl.replace(/\/$/, "");
    const withoutApi = trimmed.replace(/\/api\/?$/, "");
    return `${withoutApi}/api`;
  }, [apiBaseUrl]);

  const loginUrl = useMemo(() => {
    if (!apiBaseUrl || !code) return null;
    const params = new URLSearchParams({ code });
    return `${apiBaseUrl.replace(
      /\/$/,
      ""
    )}/auth/kakao/login?${params.toString()}`;
  }, [apiBaseUrl, code]);

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setErrorMessage("인가 코드가 존재하지 않습니다. 다시 시도해주세요.");
      return;
    }
    if (!loginUrl) {
      setStatus("error");
      setErrorMessage(
        "API 주소가 설정되지 않았습니다. NEXT_PUBLIC_API_BASE_URL을 확인해주세요."
      );
      return;
    }

    const signIn = async () => {
      try {
        const response = await fetch(loginUrl, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "로그인 요청이 실패했습니다.");
        }

        const json = (await response.json()) as ApiResult<TokenLike>;
        const tokenFromApi = pickAccessToken(
          json?.data ?? json?.result ?? null
        );

        if (!tokenFromApi) {
          throw new Error("액세스 토큰을 가져오지 못했습니다.");
        }

        localStorage.setItem("accessToken", tokenFromApi);

        // 사용자 정보 조회하여 온보딩 여부 확인
        if (apiPrefix) {
          try {
            const meRes = await fetch(`${apiPrefix}/users/me`, {
              headers: { Authorization: `Bearer ${tokenFromApi}` },
              credentials: "include",
            });
            if (meRes.status === 401) {
              router.replace("/login");
              return;
            }
            if (meRes.ok) {
              const meJson = await meRes.json();
              const onboarded = Boolean(meJson?.data?.onboarded);
              setStatus("success");
              setTimeout(
                () => router.replace(onboarded ? "/" : "/onboarding"),
                800
              );
              return;
            }
          } catch (e) {
            console.error("me fetch failed", e);
          }
        }

        setStatus("success");
        setTimeout(() => router.replace("/"), 800);
      } catch (error) {
        console.error(error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "로그인 중 문제가 발생했습니다."
        );
      }
    };

    signIn();
  }, [code, loginUrl, router]);

  const renderText = () => {
    if (status === "loading") return "카카오 계정 확인 중...";
    if (status === "success") return "로그인 완료! 잠시 후 홈으로 이동합니다.";
    return errorMessage || "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FEE500]/40 to-white flex items-center justify-center px-6 text-center">
      <div className="bg-white shadow-lg rounded-3xl p-8 max-w-md w-full border border-gray-100">
        <div className="text-4xl mb-4">
          {status === "success" ? "🎉" : status === "error" ? "😥" : "⏳"}
        </div>
        <h1 className="text-lg font-extrabold text-gray-900 mb-2">
          카카오 로그인
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">{renderText()}</p>
        {status === "error" && (
          <button
            onClick={() => router.replace("/login")}
            className="mt-6 w-full bg-[#FEE500] text-[#371D1E] font-bold py-3 rounded-xl hover:brightness-95 transition"
          >
            로그인 다시 시도하기
          </button>
        )}
      </div>
    </div>
  );
}
