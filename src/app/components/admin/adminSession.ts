export type AdminRole = "super_admin" | "standard_admin";
export type AdminSession = {
  name: string;
  email: string;
  region: string;
  role: AdminRole;
  accessToken: string;
  sessionTimeoutMinutes?: number;
};

const ADMIN_SESSION_STORAGE_KEY = "jhc_admin_session";

export const DEFAULT_ADMIN_REGION = "GCC & Egypt Hubs";

function getSessionStorage() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

function getLegacyStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

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
  sessionTimeoutMinutes,
}: {
  role: AdminRole;
  email: string;
  accessToken: string;
  name?: string | null;
  region?: string | null;
  sessionTimeoutMinutes?: number | null;
}): AdminSession {
  return {
    name: name?.trim() || email.trim(),
    email: email.trim(),
    region: region?.trim() || DEFAULT_ADMIN_REGION,
    role,
    accessToken: accessToken.trim(),
    sessionTimeoutMinutes: typeof sessionTimeoutMinutes === "number" && Number.isFinite(sessionTimeoutMinutes)
      ? sessionTimeoutMinutes
      : undefined,
  };
}

function parseAdminSession(raw: string | null): AdminSession | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AdminSession> | null;
    if (!parsed || typeof parsed !== "object") return null;

    const email = typeof parsed.email === "string" ? parsed.email.trim() : "";
    const accessToken = typeof parsed.accessToken === "string" ? parsed.accessToken.trim() : "";
    const role = normalizeAdminRole(parsed.role);

    if (!email || !accessToken) {
      return null;
    }

    return {
      name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name.trim() : email,
      email,
      region: typeof parsed.region === "string" && parsed.region.trim() ? parsed.region.trim() : DEFAULT_ADMIN_REGION,
      role,
      accessToken,
      sessionTimeoutMinutes:
        typeof parsed.sessionTimeoutMinutes === "number" && Number.isFinite(parsed.sessionTimeoutMinutes)
          ? parsed.sessionTimeoutMinutes
          : undefined,
    };
  } catch {
    return null;
  }
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  const sessionStorage = getSessionStorage();
  const legacyStorage = getLegacyStorage();

  const currentSession = parseAdminSession(sessionStorage?.getItem(ADMIN_SESSION_STORAGE_KEY) ?? null);
  if (currentSession) {
    return currentSession;
  }

  const legacySession = parseAdminSession(legacyStorage?.getItem(ADMIN_SESSION_STORAGE_KEY) ?? null);
  if (legacySession) {
    sessionStorage?.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(legacySession));
    legacyStorage?.removeItem(ADMIN_SESSION_STORAGE_KEY);
    return legacySession;
  }

  clearAdminSession();
  return null;
}

export function setAdminSession(session: AdminSession) {
  const sessionStorage = getSessionStorage();
  const legacyStorage = getLegacyStorage();
  if (!sessionStorage) return;

  sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(createAdminSession(session)));
  legacyStorage?.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

export function updateAdminSession(partial: Partial<AdminSession>) {
  const current = getAdminSession();
  if (!current) return;
  setAdminSession({
    ...current,
    ...partial,
  });
}

export function clearAdminSession() {
  const sessionStorage = getSessionStorage();
  const legacyStorage = getLegacyStorage();
  sessionStorage?.removeItem(ADMIN_SESSION_STORAGE_KEY);
  legacyStorage?.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

export function redirectToAdminLogin() {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/admin/login") {
    window.location.assign("/admin/login");
  }
}

export function clearAdminSessionAndRedirect() {
  clearAdminSession();
  redirectToAdminLogin();
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
