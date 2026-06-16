export type AdminRole = "super_admin" | "standard_admin";
export type AdminSession = {
  name: string;
  email: string;
  region: string;
  role: AdminRole;
};

const ADMIN_SESSION_STORAGE_KEY = "jhc_admin_session";

export const DEFAULT_ADMIN_REGION = "GCC & Egypt Hubs";

export function createMockAdminSession(role: AdminRole, email: string): AdminSession {
  return {
    name: role === "super_admin" ? "JHC Super Admin" : "JHC Administrator",
    email,
    region: DEFAULT_ADMIN_REGION,
    role,
  };
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.role || !parsed?.email) return null;
    return parsed;
  } catch {
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
}

export function isSuperAdmin(role: AdminRole) {
  return role === "super_admin";
}
