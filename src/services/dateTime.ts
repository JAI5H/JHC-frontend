const EXPLICIT_TIMEZONE_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/i;

export function parseBackendUtcTimestamp(value: string | null | undefined) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = EXPLICIT_TIMEZONE_PATTERN.test(trimmed) ? trimmed : `${trimmed}Z`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
