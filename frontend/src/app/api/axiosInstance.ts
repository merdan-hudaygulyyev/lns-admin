import axios, { AxiosError } from "axios";
import type { ApiErrorShape } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export function getApiOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_API_ORIGIN;
  if (configured) return configured.replace(/\/$/, "");
  try {
    return new URL(API_URL).origin;
  } catch {
    return "http://localhost:4000";
  }
}

let handlingUnauthorized = false;

function currentLocale(): string {
  if (typeof window === "undefined") return "tk";
  const first = window.location.pathname.split("/").filter(Boolean)[0];
  return ["tk", "ru", "tm"].includes(first ?? "") ? first! : "tk";
}

/** httpOnly cookies can only be cleared by the backend logout endpoint. */
async function handleUnauthorized(): Promise<void> {
  if (handlingUnauthorized || typeof window === "undefined") return;
  handlingUnauthorized = true;
  try {
    await fetch(`${getApiOrigin()}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    const locale = currentLocale();
    window.location.replace(locale === "tk" ? "/login" : `/${locale}/login`);
  } finally {
    window.setTimeout(() => {
      handlingUnauthorized = false;
    }, 2000);
  }
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    // Let axios add the multipart boundary itself.
    config.headers.delete("Content-Type");
    return config;
  }

  // Only requests with a body need JSON. Adding it to GET/DELETE triggers
  // a CORS preflight for no reason.
  if (config.data !== undefined && config.data !== null && !config.headers.has("Content-Type")) {
    config.headers.set("Content-Type", "application/json");
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorShape>) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      void handleUnauthorized();
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
}

export function getFieldErrors(error: unknown): Record<string, string> | undefined {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    return error.response?.data?.errors;
  }
  return undefined;
}
