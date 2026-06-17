export type AdminRole = "super_admin" | "standard_admin";
export type AdminSession = {
  name: string;
  email: string;
  region: string;
  role: AdminRole;
  accessToken: string;
};

const ADMIN_SESSION_STORAGE_KEY = "jhc_admin_session";

export const DEFAULT_ADMIN_REGION = "GCC & Egypt Hubs";

export function normalizeAdminRole(role: unknown, fallback: AdminRole = "standard_admin"): AdminRole {
  if (typeof role !== "string") return fallback;

  const normalized = role.trim().toLowerCase();

  if (normalized === "super_admin" || normalized === "superadmin" || normalized === "super administrator") {
    return "super_admin";
  }

  if (normalized === "standard_admin" || normalized === "admin" || normalized === "administrator" || normalized === "standard administrator") {
    return "standard_admin";
  }

  return fallback;
}

export function createAdminSession({
  role,
  email,
  accessToken,
  name,
  region,
}: {
  role: AdminRole;
  email: string;
  accessToken: string;
  name?: string | null;
  region?: string | null;
}): AdminSession {
  return {
    name: name?.trim() || email.trim(),
    email,
    region: region?.trim() || DEFAULT_ADMIN_REGION,
    role,
    accessToken,
  };
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.email || !parsed?.accessToken) {
      clearAdminSession();
      return null;
    }

    return parsed;
  } catch {
    clearAdminSession();
    return null;
  }
}

export function setAdminSession(session: AdminSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  window.sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

export function getAdminAccessToken() {
  return getAdminSession()?.accessToken ?? null;
}

export function hasAdminAccessToken() {
  return Boolean(getAdminAccessToken());
}

export function isSuperAdmin(role: AdminRole) {
  return role === "super_admin";
}
