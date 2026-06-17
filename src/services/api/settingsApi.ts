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

export async function getAdministrators() {
  const response = await apiClient.get("/api/settings/admins");
  const { items } = getListPayload(response.data);
  return items.map(normalizeAdmin);
}

export async function addAdministrator(payload: AddAdminRequest) {
  return apiClient.post("/api/settings/admin", payload);
}

export async function deleteAdministrator(adminId: number) {
  return apiClient.delete(`/api/settings/admin/${adminId}`);
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
