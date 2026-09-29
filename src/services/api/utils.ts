import axios from "axios";

export class ApiContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiContractError";
  }
}

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

export function getValidationMessages(payload: unknown) {
  const envelope = getObjectCandidate(payload);
  const errorsRecord =
    getObjectCandidate(envelope?.errors) ??
    getObjectCandidate(getObjectCandidate(envelope?.data)?.errors);

  if (!errorsRecord) {
    return [] as string[];
  }

  return Object.values(errorsRecord).flatMap((value) => {
    if (typeof value === "string" && value.trim()) {
      return [value.trim()];
    }

    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }

    return [];
  });
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
  if (error instanceof ApiContractError) {
    return fallbackMessage;
  }

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

export function getControlledActionErrorMessage(_error: unknown, fallbackMessage: string) {
  return fallbackMessage;
}

export function isRequestCanceled(error: unknown) {
  return axios.isCancel(error) || (axios.isAxiosError(error) && error.code === "ERR_CANCELED");
}

export function getAxiosErrorDetails(error: unknown, fallbackMessage: string) {
  const validationMessages = axios.isAxiosError(error)
    ? getValidationMessages(error.response?.data)
    : [];

  if (validationMessages.length > 0) {
    return {
      message: "Please review the highlighted details and try again.",
      validationMessages,
    };
  }

  return {
    message: getAxiosErrorMessage(error, fallbackMessage),
    validationMessages,
  };
}

export function requireStringValue(
  record: Record<string, unknown> | null,
  keys: string[],
  fieldName: string,
) {
  const value = getStringValue(record, keys);
  if (!value) {
    throw new ApiContractError(`Missing required field: ${fieldName}`);
  }

  return value;
}

export function requireNumberValue(
  record: Record<string, unknown> | null,
  keys: string[],
  fieldName: string,
) {
  const value = getNumberValue(record, keys);
  if (value === null) {
    throw new ApiContractError(`Missing required field: ${fieldName}`);
  }

  return value;
}
