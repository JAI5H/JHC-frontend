import axios from "axios";
import { clearAdminSession, getAdminAccessToken } from "../../app/components/admin/adminSession";

export const apiClient = axios.create({
  baseURL: "https://api---jhcdev-vr3nmq5gzq-uc.a.run.app",
});

let isRedirectingForUnauthorized = false;

apiClient.interceptors.request.use((config) => {
  const accessToken = getAdminAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url as string | undefined;
    const isAuthRequest = requestUrl?.includes("/api/auth/login") || requestUrl?.includes("/api/auth/logout");

    if (status === 401 && !isAuthRequest) {
      clearAdminSession();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/admin/login" &&
        !isRedirectingForUnauthorized
      ) {
        isRedirectingForUnauthorized = true;
        window.location.assign("/admin/login");
      }
    }

    return Promise.reject(error);
  },
);
