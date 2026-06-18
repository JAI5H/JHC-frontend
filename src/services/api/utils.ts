import axios from "axios";

export function getObjectCandidate(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export function getArrayCandidate(value: unknown) {
  return Array.isArray(value) ? value : null;
}

export function getStringValue(record: Record<string, unknown> | null, keys: string[]) {
  if (!record) return null;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

export function getNumberValue(record: Record<string, unknown> | null, keys: string[]) {
  if (!record) return null;

  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

export function getBooleanValue(record: Record<string, unknown> | null, keys: string[]) {
  if (!record) return null;

  for (const key of keys) {
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
  }

  return null;
}

export function getListPayload(payload: unknown) {
  const envelope = getObjectCandidate(payload);
  const dataRecord = getObjectCandidate(envelope?.data);

  const items =
    getArrayCandidate(payload) ??
    getArrayCandidate(envelope?.items) ??
    getArrayCandidate(envelope?.data) ??
    getArrayCandidate(dataRecord?.items) ??
    getArrayCandidate(dataRecord?.data) ??
    [];

  const totalCount =
    getNumberValue(envelope, ["totalCount", "count", "total", "totalItems"]) ??
    getNumberValue(dataRecord, ["totalCount", "count", "total", "totalItems"]) ??
    items.length;

  return {
    envelope,
    dataRecord,
    items,
    totalCount,
  };
}

export function getApiMessage(payload: unknown, fallbackMessage: string) {
  const envelope = getObjectCandidate(payload);
  return getStringValue(envelope, ["message", "title", "detail"]) ?? fallbackMessage;
}

function getSafeStatusMessage(status: number | undefined, fallbackMessage: string) {
  if (status === 401) return "Your session is no longer valid. Please sign in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested resource could not be found.";
  if (status === 429) return "Too many requests were sent. Please try again in a moment.";
  if (typeof status === "number" && status >= 500) return fallbackMessage;
  return null;
}

export function getAxiosErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const status = error.response?.status;
  const safeStatusMessage = getSafeStatusMessage(status, fallbackMessage);
  if (safeStatusMessage) {
    return safeStatusMessage;
  }

  const responseMessage = getApiMessage(error.response?.data, fallbackMessage).trim();
  if (!responseMessage || responseMessage === fallbackMessage) {
    return fallbackMessage;
  }

  if (responseMessage.length > 180) {
    return fallbackMessage;
  }

  return responseMessage;
}
