export type ApiResponse<T> = {
  message: string;
  data: T;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiData<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_API_BASE_URL is missing");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText} - ${text}`);
  }

  // 204 대응
  if (res.status === 204) return undefined as T;

  const json = (await res.json()) as ApiResponse<T>;
  return json.data;
}
