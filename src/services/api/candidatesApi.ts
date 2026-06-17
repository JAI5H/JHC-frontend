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

export type CandidateRecord = {
  id: number;
  fullName: string;
  email: string;
  currentJobTitle: string;
  yearsOfExperience: string;
  industry: string;
  currentCountry: string;
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

function normalizeCandidate(item: unknown, index: number): CandidateRecord {
  const record = getObjectCandidate(item);

  return {
    id: getNumberValue(record, ["id", "candidateId"]) ?? index + 1,
    fullName: getStringValue(record, ["fullName", "name"]) ?? "Unknown Candidate",
    email: getStringValue(record, ["email"]) ?? "",
    currentJobTitle: getStringValue(record, ["currentJobTitle", "jobTitle", "title"]) ?? "Not specified",
    yearsOfExperience: getStringValue(record, ["yearsOfExperience", "experience", "experienceYears"]) ?? "Not specified",
    industry: getStringValue(record, ["industry"]) ?? "",
    currentCountry: getStringValue(record, ["currentCountry", "country", "preferredWorkCountry"]) ?? "Not specified",
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

export async function getCandidates(params: CandidateQueryParams) {
  const response = await apiClient.get("/api/candidates", {
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

export async function getCandidateStats() {
  const response = await apiClient.get("/api/candidates/stats");
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
