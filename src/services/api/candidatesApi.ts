import { apiClient } from "./client";
import {
  getApiMessage,
  getBooleanValue,
  getListPayload,
  getNumberValue,
  getObjectCandidate,
  getStringValue,
} from "./utils";

export type CandidateQueryParams = {
  search?: string;
  status?: string;
  industry?: string;
  country?: string;
  sort?: string;
  isArchived?: boolean;
  pageNumber?: number;
  pageSize?: number;
};

type RequestOptions = {
  signal?: AbortSignal;
};

export type CandidateRecord = {
  id: number;
  fullName: string;
  email: string;
  mobileNumber?: string;
  nationality?: string;
  currentJobTitle: string;
  yearsOfExperience: string;
  industry: string;
  currentCountry: string;
  currentCity?: string;
  expectedSalary?: string;
  salaryCurrency?: string;
  employmentType?: string[];
  preferredWorkCountry?: string;
  englishLevel?: string;
  availableToRelocate?: string;
  linkedinProfile?: string;
  additionalNotes?: string;
  status: string;
  createdAt: string | null;
};

export type CandidateStats = {
  totalCandidates: number;
  newCandidates: number;
  reviewedCandidates: number;
  shortlistedCandidates: number;
  interviewCandidates: number;
  hiredCandidates: number;
  rejectedCandidates: number;
};

export type CandidateStatus = "New" | "Reviewed" | "Shortlisted" | "Interview" | "Hired" | "Rejected";

function normalizeEmploymentType(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      }
    } catch {
      return [value];
    }

    return [value];
  }

  return undefined;
}

function normalizeCandidate(item: unknown, index: number): CandidateRecord {
  const record = getObjectCandidate(item);
  const normalizedEmploymentType =
    normalizeEmploymentType(record?.employmentType) ??
    normalizeEmploymentType(record?.employmentTypes) ??
    normalizeEmploymentType(record?.preferredEmploymentType);

  return {
    id: getNumberValue(record, ["id", "candidateId"]) ?? index + 1,
    fullName: getStringValue(record, ["fullName", "name"]) ?? "Unknown Candidate",
    email: getStringValue(record, ["email"]) ?? "",
    mobileNumber: getStringValue(record, ["mobileNumber", "phone", "phoneNumber"]),
    nationality: getStringValue(record, ["nationality"]),
    currentJobTitle: getStringValue(record, ["currentJobTitle", "jobTitle", "title"]) ?? "Not specified",
    yearsOfExperience: getStringValue(record, ["yearsOfExperience", "experience", "experienceYears"]) ?? "Not specified",
    industry: getStringValue(record, ["industry"]) ?? "",
    currentCountry: getStringValue(record, ["currentCountry", "country", "preferredWorkCountry"]) ?? "Not specified",
    currentCity: getStringValue(record, ["currentCity", "city"]),
    expectedSalary: getStringValue(record, ["expectedSalary", "ExpectedSalary", "expected_salary"]),
    salaryCurrency: getStringValue(record, ["salaryCurrency", "SalaryCurrency", "salary_currency"]),
    employmentType: normalizedEmploymentType,
    preferredWorkCountry: getStringValue(record, ["preferredWorkCountry", "preferredCountry"]),
    englishLevel: getStringValue(record, ["englishLevel", "englishProficiency"]),
    availableToRelocate: getStringValue(record, ["availableToRelocate"]),
    linkedinProfile: getStringValue(record, ["linkedInProfile", "linkedinProfile", "linkedinUrl", "linkedInUrl"]),
    additionalNotes: getStringValue(record, ["additionalNotes", "notes"]),
    status: getStringValue(record, ["status"]) ?? "New",
    createdAt:
      getStringValue(record, ["createdAt", "createdOn", "submittedAt", "applicationDate", "dateCreated"]) ?? null,
  };
}

function normalizeStats(payload: unknown): CandidateStats {
  const envelope = getObjectCandidate(payload);
  const dataRecord = getObjectCandidate(envelope?.data) ?? envelope;

  return {
    totalCandidates: getNumberValue(dataRecord, ["totalCandidates", "total", "count"]) ?? 0,
    newCandidates: getNumberValue(dataRecord, ["newCandidates", "new", "newCount"]) ?? 0,
    reviewedCandidates: getNumberValue(dataRecord, ["reviewedCandidates", "reviewed", "reviewedCount"]) ?? 0,
    shortlistedCandidates: getNumberValue(dataRecord, ["shortlistedCandidates", "shortlisted", "shortlistedCount"]) ?? 0,
    interviewCandidates: getNumberValue(dataRecord, ["interviewCandidates", "interview", "interviewCount"]) ?? 0,
    hiredCandidates: getNumberValue(dataRecord, ["hiredCandidates", "hired", "hiredCount"]) ?? 0,
    rejectedCandidates: getNumberValue(dataRecord, ["rejectedCandidates", "rejected", "rejectedCount"]) ?? 0,
  };
}

export async function getCandidates(params: CandidateQueryParams, options?: RequestOptions) {
  const response = await apiClient.get("/api/candidates", {
    signal: options?.signal,
    params: {
      Search: params.search || undefined,
      Status: params.status || undefined,
      Industry: params.industry || undefined,
      Country: params.country || undefined,
      Sort: params.sort || undefined,
      IsArchived: params.isArchived,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    },
  });

  const { items, totalCount } = getListPayload(response.data);

  return {
    items: items.map(normalizeCandidate),
    totalCount,
    raw: response.data,
  };
}

export async function getAllCandidates(params: CandidateQueryParams, options?: RequestOptions) {
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 100;
  const firstPage = await getCandidates({
    ...params,
    pageNumber: 1,
    pageSize,
  }, options);

  if (firstPage.totalCount <= firstPage.items.length) {
    return firstPage;
  }

  const allItems = [...firstPage.items];
  const totalPages = Math.ceil(firstPage.totalCount / pageSize);

  for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
    if (options?.signal?.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }

    const nextPage = await getCandidates({
      ...params,
      pageNumber: currentPage,
      pageSize,
    }, options);

    allItems.push(...nextPage.items);
  }

  return {
    items: allItems,
    totalCount: firstPage.totalCount,
    raw: firstPage.raw,
  };
}

export async function getCandidateStats(options?: RequestOptions) {
  const response = await apiClient.get("/api/candidates/stats", {
    signal: options?.signal,
  });
  return normalizeStats(response.data);
}

export async function exportCandidates(params: CandidateQueryParams) {
  return apiClient.get("/api/candidates/export", {
    params: {
      Search: params.search || undefined,
      Status: params.status || undefined,
      Industry: params.industry || undefined,
      Country: params.country || undefined,
      Sort: params.sort || undefined,
      IsArchived: params.isArchived,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    },
    responseType: "blob",
  });
}

export async function downloadCandidateCv(candidateId: number) {
  return apiClient.get(`/api/candidates/${candidateId}/cv`, {
    responseType: "blob",
  });
}

export async function updateCandidateStatus(candidateId: number, status: CandidateStatus) {
  return apiClient.put(`/api/candidates/${candidateId}/status`, { status });
}

export function deriveCandidateStatsFromList(items: CandidateRecord[], totalCount: number): CandidateStats {
  const counts = items.reduce(
    (acc, candidate) => {
      const status = candidate.status.trim().toLowerCase();
      if (status === "new") acc.newCandidates += 1;
      if (status === "reviewed") acc.reviewedCandidates += 1;
      if (status === "shortlisted") acc.shortlistedCandidates += 1;
      if (status === "interview") acc.interviewCandidates += 1;
      if (status === "hired") acc.hiredCandidates += 1;
      if (status === "rejected") acc.rejectedCandidates += 1;
      return acc;
    },
    {
      totalCandidates: totalCount,
      newCandidates: 0,
      reviewedCandidates: 0,
      shortlistedCandidates: 0,
      interviewCandidates: 0,
      hiredCandidates: 0,
      rejectedCandidates: 0,
    },
  );

  return counts;
}

export function isCandidateArchived(item: unknown) {
  const record = getObjectCandidate(item);
  return getBooleanValue(record, ["isArchived", "archived"]) ?? false;
}

export function getCandidatesErrorMessage(payload: unknown) {
  return getApiMessage(payload, "Unable to load candidates right now.");
}
