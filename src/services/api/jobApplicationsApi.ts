import { apiClient } from "./client";
import {
  getArrayCandidate,
  getListPayload,
  getNumberValue,
  getObjectCandidate,
  getStringValue,
} from "./utils";

type RequestOptions = {
  signal?: AbortSignal;
};

export type ReadyToStart = "Yes" | "No" | "Other";
export type JobApplicationStatus = "New" | "UnderReview" | "Shortlisted" | "Hired" | "Rejected";
export type AiScreeningStatus = "Pending" | "Processing" | "Completed" | "Failed" | "Unknown";

export type JobApplicationAiScreening = {
  status: AiScreeningStatus;
  matchScore: number | null;
  explanation: string | null;
  strengths: string[];
  relevantSkills: string[];
  gaps: string[];
  errorMessage: string | null;
  modelProvider: string | null;
  evaluatedAt: string | null;
};

export type JobApplicationRecord = {
  id: number;
  jobId: number;
  jobTitle: string;
  name: string;
  age: number;
  nationality: string;
  location: string;
  experience: string;
  readyToStart: ReadyToStart | string;
  expectedSalary: string;
  expectedSalaryCurrency: string | null;
  additionalNotes: string | null;
  cvFileName: string;
  cvUrl: string | null;
  status: JobApplicationStatus;
  aiScreening: JobApplicationAiScreening | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type JobApplicationStats = {
  totalApplications: number;
  newApplications: number;
  underReviewApplications: number;
  shortlistedApplications: number;
  hiredApplications: number;
  rejectedApplications: number;
};

export type JobApplicationsQuery = {
  pageNumber?: number;
  pageSize?: number;
};

export type CreateJobApplicationRequest = {
  name: string;
  age: number | string;
  nationality: string;
  experience: string;
  readyToStart: ReadyToStart;
  expectedSalary: string;
  expectedSalaryCurrency?: string;
  additionalNotes?: string;
  cv: File;
};

function normalizeApplicationStatus(value: string | null | undefined): JobApplicationStatus {
  const normalized = value?.trim().toLowerCase().replace(/[\s_-]/g, "");
  if (normalized === "underreview" || normalized === "reviewed" || normalized === "interview") return "UnderReview";
  if (normalized === "shortlisted") return "Shortlisted";
  if (normalized === "hired") return "Hired";
  if (normalized === "rejected") return "Rejected";
  return "New";
}

function normalizeAiScreeningStatus(value: string | null | undefined): AiScreeningStatus {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "pending") return "Pending";
  if (normalized === "processing") return "Processing";
  if (normalized === "completed") return "Completed";
  if (normalized === "failed") return "Failed";
  return "Unknown";
}

function normalizeStringArray(value: unknown) {
  const directArray = getArrayCandidate(value);
  if (directArray) {
    return directArray.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      const parsedArray = getArrayCandidate(parsed);
      if (parsedArray) {
        return parsedArray.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      }
    } catch {
      return [value];
    }
  }

  return [];
}

function normalizeAiScreening(payload: unknown): JobApplicationAiScreening | null {
  const record = getObjectCandidate(payload);
  if (!record) return null;

  return {
    status: normalizeAiScreeningStatus(getStringValue(record, ["status", "Status"])),
    matchScore: getNumberValue(record, ["matchScore", "MatchScore"]),
    explanation: getStringValue(record, ["explanation", "Explanation"]),
    strengths: normalizeStringArray(record.strengths ?? record.Strengths),
    relevantSkills: normalizeStringArray(record.relevantSkills ?? record.RelevantSkills),
    gaps: normalizeStringArray(record.gaps ?? record.Gaps),
    errorMessage: getStringValue(record, ["errorMessage", "ErrorMessage"]),
    modelProvider: getStringValue(record, ["modelProvider", "ModelProvider"]),
    evaluatedAt: getStringValue(record, ["evaluatedAt", "EvaluatedAt"]),
  };
}

function normalizeApplication(payload: unknown): JobApplicationRecord {
  const record = getObjectCandidate(payload);
  return {
    id: getNumberValue(record, ["id", "applicationId"]) ?? 0,
    jobId: getNumberValue(record, ["jobId"]) ?? 0,
    jobTitle: getStringValue(record, ["jobTitle"]) ?? "",
    name: getStringValue(record, ["name"]) ?? "",
    age: getNumberValue(record, ["age"]) ?? 0,
    nationality: getStringValue(record, ["nationality"]) ?? "",
    location: getStringValue(record, ["location", "country", "currentCountry"]) ?? "",
    experience: getStringValue(record, ["experience"]) ?? "",
    readyToStart: getStringValue(record, ["readyToStart"]) ?? "",
    expectedSalary: getStringValue(record, ["expectedSalary"]) ?? "",
    expectedSalaryCurrency: getStringValue(record, ["expectedSalaryCurrency", "ExpectedSalaryCurrency"]) ?? null,
    additionalNotes: getStringValue(record, ["additionalNotes"]) ?? null,
    cvFileName: getStringValue(record, ["cvFileName"]) ?? "",
    cvUrl: getStringValue(record, ["cvUrl"]) ?? null,
    status: normalizeApplicationStatus(getStringValue(record, ["status", "Status"])),
    aiScreening: normalizeAiScreening(record?.aiScreening ?? record?.AiScreening),
    createdAt: getStringValue(record, ["createdAt"]) ?? null,
    updatedAt: getStringValue(record, ["updatedAt"]) ?? null,
  };
}

function normalizeApplicationStats(payload: unknown): JobApplicationStats {
  const envelope = getObjectCandidate(payload);
  const dataRecord = getObjectCandidate(envelope?.data) ?? envelope;

  return {
    totalApplications: getNumberValue(dataRecord, ["totalApplications", "TotalApplications", "total", "totalCount", "TotalCount", "count"]) ?? 0,
    newApplications: getNumberValue(dataRecord, ["newApplications", "NewApplications", "new", "New", "newCount", "NewCount"]) ?? 0,
    underReviewApplications: getNumberValue(dataRecord, ["underReviewApplications", "UnderReviewApplications", "underReview", "UnderReview", "underReviewCount", "UnderReviewCount"]) ?? 0,
    shortlistedApplications: getNumberValue(dataRecord, ["shortlistedApplications", "ShortlistedApplications", "shortlisted", "Shortlisted", "shortlistedCount", "ShortlistedCount"]) ?? 0,
    hiredApplications: getNumberValue(dataRecord, ["hiredApplications", "HiredApplications", "hired", "Hired", "hiredCount", "HiredCount"]) ?? 0,
    rejectedApplications: getNumberValue(dataRecord, ["rejectedApplications", "RejectedApplications", "rejected", "Rejected", "rejectedCount", "RejectedCount"]) ?? 0,
  };
}

function toFormData(payload: CreateJobApplicationRequest) {
  const formData = new FormData();
  formData.append("Name", payload.name);
  formData.append("Age", String(payload.age));
  formData.append("Nationality", payload.nationality);
  formData.append("Experience", payload.experience);
  formData.append("ReadyToStart", payload.readyToStart);
  formData.append("ExpectedSalary", payload.expectedSalary);
  if (payload.expectedSalary.trim() && payload.expectedSalaryCurrency?.trim()) {
    formData.append("ExpectedSalaryCurrency", payload.expectedSalaryCurrency.trim());
  }
  formData.append("AdditionalNotes", payload.additionalNotes ?? "");
  formData.append("Cv", payload.cv);
  return formData;
}

export async function submitJobApplication(jobId: number, payload: CreateJobApplicationRequest) {
  const response = await apiClient.post(`/api/jobs/${jobId}/applications`, toFormData(payload));
  return normalizeApplication(response.data);
}

export async function getJobApplications(
  jobId: number,
  query: JobApplicationsQuery = {},
  options?: RequestOptions,
) {
  const response = await apiClient.get(`/api/jobs/${jobId}/applications`, {
    signal: options?.signal,
    params: {
      PageNumber: query.pageNumber,
      PageSize: query.pageSize,
    },
  });
  const { items, totalCount } = getListPayload(response.data);
  return {
    items: items.map(normalizeApplication),
    totalCount,
    raw: response.data,
  };
}

export async function getJobApplicationById(
  jobId: number,
  applicationId: number,
  options?: RequestOptions,
) {
  const response = await apiClient.get(`/api/jobs/${jobId}/applications/${applicationId}`, {
    signal: options?.signal,
  });
  return normalizeApplication(response.data);
}

export async function retryJobApplicationAiScreening(jobId: number, applicationId: number) {
  await apiClient.post(`/api/jobs/${jobId}/applications/${applicationId}/ai-screening/retry`);
}

export async function analyzeJobApplicationWithAi(jobId: number, applicationId: number) {
  await apiClient.post(`/api/jobs/${jobId}/applications/${applicationId}/ai-screening/analyze`);
}

export async function getJobApplicationStats(jobId: number, options?: RequestOptions) {
  const response = await apiClient.get(`/api/jobs/${jobId}/applications/stats`, {
    signal: options?.signal,
  });
  return normalizeApplicationStats(response.data);
}

export async function updateJobApplicationStatus(
  jobId: number,
  applicationId: number,
  status: JobApplicationStatus,
) {
  const response = await apiClient.patch(`/api/jobs/${jobId}/applications/${applicationId}/status`, {
    status,
  });
  return normalizeApplication(response.data);
}

export async function getJobApplicationCv(
  jobId: number,
  applicationId: number,
  options?: RequestOptions,
) {
  const response = await apiClient.get<Blob>(`/api/jobs/${jobId}/applications/${applicationId}/cv`, {
    signal: options?.signal,
    responseType: "blob",
  });

  return {
    blob: response.data,
    contentDisposition: response.headers["content-disposition"] as string | undefined,
    contentType: response.headers["content-type"] as string | undefined,
  };
}
