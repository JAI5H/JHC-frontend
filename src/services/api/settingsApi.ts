import { apiClient } from "./client";
import { normalizeAdminRole } from "../../app/components/admin/adminSession";
import {
  ApiContractError,
  getApiMessage,
  getBooleanValue,
  getListPayload,
  getNumberValue,
  getObjectCandidate,
  requireNumberValue,
  requireStringValue,
  getStringValue,
} from "./utils";

export type AdminDirectoryRecord = {
  id: number;
  fullName: string;
  email: string;
  region: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  createdAt: string | null;
};

export type ChangeEmailRequest = {
  currentPassword: string;
  newEmail: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type AddAdminRequest = {
  fullName: string;
  email: string;
  password: string;
};

export type ProfileSettings = {
  fullName: string;
  contactEmail: string;
  region: string;
};

export type SystemSettings = {
  sessionTimeoutMinutes: number;
};

export type EditAdministratorRequest = {
  fullName: string;
  email: string;
};

export type ResetAdministratorPasswordRequest = {
  newPassword: string;
};

type RequestOptions = {
  signal?: AbortSignal;
};

function normalizeAdmin(item: unknown, index: number): AdminDirectoryRecord {
  const record = getObjectCandidate(item);
  const role = getStringValue(record, ["role"]) ?? "";
  const normalizedRole = normalizeAdminRole(role);
  const fullName = requireStringValue(record, ["fullName", "name"], "admin.fullName");
  const email = requireStringValue(record, ["email"], "admin.email");

  return {
    id: getNumberValue(record, ["id", "adminId"]) ?? index + 1,
    fullName,
    email,
    region: getStringValue(record, ["region"]) ?? "",
    isActive: getBooleanValue(record, ["isActive", "active"]) ?? true,
    isSuperAdmin:
      (getBooleanValue(record, ["isSuperAdmin", "superAdmin"]) ?? false) ||
      normalizedRole === "super_admin",
    createdAt: getStringValue(record, ["createdAt", "createdOn", "dateCreated"]) ?? null,
  };
}

function normalizeProfileSettings(payload: unknown): ProfileSettings {
  const envelope = getObjectCandidate(payload);
  const dataRecord = getObjectCandidate(envelope?.data) ?? envelope;

  if (!dataRecord) {
    throw new ApiContractError("Missing profile settings payload.");
  }

  return {
    fullName: requireStringValue(dataRecord, ["fullName", "name"], "profile.fullName"),
    contactEmail: requireStringValue(dataRecord, ["contactEmail", "email"], "profile.contactEmail"),
    region: requireStringValue(dataRecord, ["region"], "profile.region"),
  };
}

function normalizeSystemSettings(payload: unknown): SystemSettings {
  const envelope = getObjectCandidate(payload);
  const dataRecord = getObjectCandidate(envelope?.data) ?? envelope;

  if (!dataRecord) {
    throw new ApiContractError("Missing system settings payload.");
  }

  return {
    sessionTimeoutMinutes: requireNumberValue(
      dataRecord,
      ["sessionTimeoutMinutes", "sessionTimeout", "timeoutMinutes"],
      "system.sessionTimeoutMinutes",
    ),
  };
}

export async function getAdministrators(options?: RequestOptions) {
  const response = await apiClient.get("/api/settings/admins", {
    signal: options?.signal,
  });
  const { items } = getListPayload(response.data);
  return items.map(normalizeAdmin);
}

export async function addAdministrator(payload: AddAdminRequest) {
  return apiClient.post("/api/settings/admin", payload);
}

export async function getProfileSettings(options?: RequestOptions) {
  const response = await apiClient.get("/api/settings/profile", {
    signal: options?.signal,
  });
  return normalizeProfileSettings(response.data);
}

export async function saveProfileSettings(payload: ProfileSettings) {
  return apiClient.put("/api/settings/profile", payload);
}

export async function getSystemSettings(options?: RequestOptions) {
  const response = await apiClient.get("/api/settings/system", {
    signal: options?.signal,
  });
  return normalizeSystemSettings(response.data);
}

export async function saveSystemSettings(payload: SystemSettings) {
  return apiClient.put("/api/settings/system", payload);
}

export async function deleteAdministrator(adminId: number) {
  return apiClient.delete(`/api/settings/admin/${adminId}`);
}

export async function editAdministrator(adminId: number, payload: EditAdministratorRequest) {
  return apiClient.put(`/api/settings/admin/${adminId}`, payload);
}

export async function setAdministratorStatus(adminId: number) {
  return apiClient.put(`/api/settings/admin/${adminId}/status`);
}

export async function resetAdministratorPassword(adminId: number, payload: ResetAdministratorPasswordRequest) {
  return apiClient.post(`/api/settings/admin/${adminId}/reset-password`, payload);
}

export async function changeAdminEmail(payload: ChangeEmailRequest) {
  return apiClient.put("/api/settings/email", payload);
}

export async function changeAdminPassword(payload: ChangePasswordRequest) {
  return apiClient.put("/api/settings/password", payload);
}

export function getSettingsErrorMessage(payload: unknown, fallbackMessage: string) {
  return getApiMessage(payload, fallbackMessage);
}
