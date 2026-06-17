import { apiClient } from "./client";
import {
  getApiMessage,
  getBooleanValue,
  getListPayload,
  getNumberValue,
  getObjectCandidate,
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

function normalizeAdmin(item: unknown, index: number): AdminDirectoryRecord {
  const record = getObjectCandidate(item);
  const role = getStringValue(record, ["role"]) ?? "";

  return {
    id: getNumberValue(record, ["id", "adminId"]) ?? index + 1,
    fullName: getStringValue(record, ["fullName", "name"]) ?? "Administrator",
    email: getStringValue(record, ["email"]) ?? "",
    region: getStringValue(record, ["region"]) ?? "All Regions",
    isActive: getBooleanValue(record, ["isActive", "active"]) ?? true,
    isSuperAdmin:
      (getBooleanValue(record, ["isSuperAdmin", "superAdmin"]) ?? false) ||
      role.trim().toLowerCase().includes("super"),
    createdAt: getStringValue(record, ["createdAt", "createdOn", "dateCreated"]) ?? null,
  };
}

function normalizeProfileSettings(payload: unknown): ProfileSettings {
  const envelope = getObjectCandidate(payload);
  const dataRecord = getObjectCandidate(envelope?.data) ?? envelope;

  return {
    fullName: getStringValue(dataRecord, ["fullName", "name"]) ?? "JHC Admin",
    contactEmail: getStringValue(dataRecord, ["contactEmail", "email"]) ?? "admin@jhc-group.com",
    region: getStringValue(dataRecord, ["region"]) ?? "All Regions",
  };
}

function normalizeSystemSettings(payload: unknown): SystemSettings {
  const envelope = getObjectCandidate(payload);
  const dataRecord = getObjectCandidate(envelope?.data) ?? envelope;

  return {
    sessionTimeoutMinutes: getNumberValue(dataRecord, ["sessionTimeoutMinutes", "sessionTimeout", "timeoutMinutes"]) ?? 30,
  };
}

export async function getAdministrators() {
  const response = await apiClient.get("/api/settings/admins");
  const { items } = getListPayload(response.data);
  return items.map(normalizeAdmin);
}

export async function addAdministrator(payload: AddAdminRequest) {
  return apiClient.post("/api/settings/admin", payload);
}

export async function getProfileSettings() {
  const response = await apiClient.get("/api/settings/profile");
  return normalizeProfileSettings(response.data);
}

export async function saveProfileSettings(payload: ProfileSettings) {
  return apiClient.put("/api/settings/profile", payload);
}

export async function getSystemSettings() {
  const response = await apiClient.get("/api/settings/system");
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
