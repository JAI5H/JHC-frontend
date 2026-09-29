import axios from "axios";
import { clearAdminSessionAndRedirect, getAdminAccessToken } from "../../app/components/admin/adminSession";

const LOCAL_API_BASE_URL = "http://localhost:5285";
const DEFAULT_DEPLOYED_API_BASE_URL = "https://api---jhcdev-vr3nmq5gzq-uc.a.run.app";

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const environmentDefault = import.meta.env.DEV ? LOCAL_API_BASE_URL : DEFAULT_DEPLOYED_API_BASE_URL;
  const candidate = configuredBaseUrl || environmentDefault;

  try {
    const parsedUrl = new URL(candidate);
    if (parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:") {
      return parsedUrl.toString().replace(/\/$/, "");
    }
  } catch {
    // Fall back to the known-safe default if the configured value is invalid.
  }

  return environmentDefault;
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
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
      if (!isRedirectingForUnauthorized) {
        isRedirectingForUnauthorized = true;
        clearAdminSessionAndRedirect();
      }
    }

    return Promise.reject(error);
  },
);
