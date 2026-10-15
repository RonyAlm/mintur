import axios from "axios";
import { api } from "@/lib/axios";

const AUTH_PATH = "/auth";
let interceptorsRegistered = false;

const isAuthPath = (url?: string): boolean => {
  if (!url) return false;

  const path = url.split("?")[0];

  return path === AUTH_PATH || path.startsWith(`${AUTH_PATH}/`);
};

/**
 * Registra los interceptores globales una sola vez.
 * Las cookies HttpOnly se envían mediante withCredentials.
 */
export const registerAxiosInterceptors = (): void => {
  if (interceptorsRegistered) return;

  interceptorsRegistered = true;

  api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        !isAuthPath(error.config?.url) &&
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith(AUTH_PATH)
      ) {
        window.location.assign("/auth/login");
      }

      return Promise.reject(error);
    },
  );
};
