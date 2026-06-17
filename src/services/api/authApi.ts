import { apiClient } from "./client";
import { getObjectCandidate, getStringValue } from "./utils";

export type LoginRequest = {
  email: string;
  password: string;
};

type AuthEnvelope = {
  success?: boolean;
  message?: string;
  data?: unknown;
  [key: string]: unknown;
};

export type AuthProfile = {
  accessToken: string | null;
  email: string | null;
  name: string | null;
  role: string | null;
  region: string | null;
};

export async function loginAdmin(payload: LoginRequest) {
  return apiClient.post<AuthEnvelope>("/api/auth/login", payload);
}

export async function logoutAdmin() {
  return apiClient.post("/api/auth/logout");
}

export function extractAuthProfile(payload: unknown): AuthProfile {
  const envelope = getObjectCandidate(payload);
  const dataRecord = getObjectCandidate(envelope?.data);

  const accessToken =
    getStringValue(dataRecord, ["token", "accessToken", "jwt", "bearerToken"]) ??
    getStringValue(envelope, ["token", "accessToken", "jwt", "bearerToken"]) ??
    (typeof envelope?.data === "string" && envelope.data.trim() ? envelope.data : null);

  const email =
    getStringValue(dataRecord, ["email"]) ??
    getStringValue(envelope, ["email"]);

  const name =
    getStringValue(dataRecord, ["fullName", "name"]) ??
    getStringValue(envelope, ["fullName", "name"]);

  const role =
    getStringValue(dataRecord, ["role"]) ??
    getStringValue(envelope, ["role"]);

  const region =
    getStringValue(dataRecord, ["region"]) ??
    getStringValue(envelope, ["region"]);

  return {
    accessToken,
    email,
    name,
    role,
    region,
  };
}
