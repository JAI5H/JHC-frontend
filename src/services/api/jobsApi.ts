import { apiClient } from "./client";
import {
  getListPayload,
  getNumberValue,
  getObjectCandidate,
  getStringValue,
} from "./utils";

type RequestOptions = {
  signal?: AbortSignal;
};

export type JobStatus = "Draft" | "Published" | "Closed";

export type JobListQuery = {
  search?: string;
  status?: JobStatus | "";
  pageNumber?: number;
  pageSize?: number;
};

export type JobRecord = {
  id: number;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange: string | null;
  skills: string | null;
  applicationDeadline: string | null;
  status?: JobStatus;
  slug: string;
  createdByAdminId?: number;
  createdByAdminName?: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SaveJobRequest = {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange?: string;
  skills?: string[] | string;
  applicationDeadline?: string | null;
};

function normalizeStatus(value: string | null): JobStatus | undefined {
  if (value === "Draft" || value === "Published" || value === "Closed") return value;
  return undefined;
}

function normalizeJob(payload: unknown): JobRecord {
  const record = getObjectCandidate(payload);
  return {
    id: getNumberValue(record, ["id", "jobId"]) ?? 0,
    title: getStringValue(record, ["title"]) ?? "",
    description: getStringValue(record, ["description"]) ?? "",
    requirements: getStringValue(record, ["requirements"]) ?? "",
    responsibilities: getStringValue(record, ["responsibilities"]) ?? "",
    location: getStringValue(record, ["location"]) ?? "",
    employmentType: getStringValue(record, ["employmentType"]) ?? "",
    experienceLevel: getStringValue(record, ["experienceLevel"]) ?? "",
    salaryRange: getStringValue(record, ["salaryRange"]) ?? null,
    skills: getStringValue(record, ["skills"]) ?? null,
    applicationDeadline: getStringValue(record, ["applicationDeadline", "deadline"]) ?? null,
    status: normalizeStatus(getStringValue(record, ["status"])),
    slug: getStringValue(record, ["slug"]) ?? "",
    createdByAdminId: getNumberValue(record, ["createdByAdminId"]) ?? undefined,
    createdByAdminName: getStringValue(record, ["createdByAdminName"]) ?? undefined,
    createdAt: getStringValue(record, ["createdAt"]) ?? null,
    updatedAt: getStringValue(record, ["updatedAt"]) ?? null,
  };
}

function buildJobParams(query: JobListQuery) {
  return {
    Search: query.search || undefined,
    Status: query.status || undefined,
    PageNumber: query.pageNumber,
    PageSize: query.pageSize,
  };
}

function normalizeJobPayload(payload: SaveJobRequest) {
  const skills = Array.isArray(payload.skills)
    ? payload.skills.filter(Boolean).join(", ")
    : payload.skills;

  return {
    Title: payload.title,
    Description: payload.description,
    Requirements: payload.requirements,
    Responsibilities: payload.responsibilities,
    Location: payload.location,
    EmploymentType: payload.employmentType,
    ExperienceLevel: payload.experienceLevel,
    SalaryRange: payload.salaryRange?.trim() || null,
    Skills: skills?.trim() || null,
    ApplicationDeadline: payload.applicationDeadline || null,
  };
}

export function splitJobSkills(skills: string | null | undefined) {
  if (!skills) return [];
  return skills
    .split(/,|\n/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export async function getPublicJobs(query: JobListQuery = {}, options?: RequestOptions) {
  const response = await apiClient.get("/api/jobs", {
    signal: options?.signal,
    params: buildJobParams(query),
  });
  const { items, totalCount } = getListPayload(response.data);
  return {
    items: items.map(normalizeJob),
    totalCount,
    raw: response.data,
  };
}

export async function getPublicJobBySlug(slug: string, options?: RequestOptions) {
  const response = await apiClient.get(`/api/jobs/${encodeURIComponent(slug)}`, {
    signal: options?.signal,
  });
  return normalizeJob(response.data);
}

export async function getAdminJobs(query: JobListQuery = {}, options?: RequestOptions) {
  const response = await apiClient.get("/api/jobs/admin", {
    signal: options?.signal,
    params: buildJobParams(query),
  });
  const { items, totalCount } = getListPayload(response.data);
  return {
    items: items.map(normalizeJob),
    totalCount,
    raw: response.data,
  };
}

export async function getAdminJobById(jobId: number, options?: RequestOptions) {
  const response = await apiClient.get(`/api/jobs/admin/${jobId}`, {
    signal: options?.signal,
  });
  return normalizeJob(response.data);
}

export async function createJob(payload: SaveJobRequest) {
  const response = await apiClient.post("/api/jobs", normalizeJobPayload(payload));
  return normalizeJob(response.data);
}

export async function updateJob(jobId: number, payload: SaveJobRequest) {
  const response = await apiClient.put(`/api/jobs/${jobId}`, normalizeJobPayload(payload));
  return normalizeJob(response.data);
}

export async function publishJob(jobId: number) {
  const response = await apiClient.post(`/api/jobs/${jobId}/publish`);
  return normalizeJob(response.data);
}

export async function unpublishJob(jobId: number) {
  const response = await apiClient.post(`/api/jobs/${jobId}/unpublish`);
  return normalizeJob(response.data);
}

export async function closeJob(jobId: number) {
  const response = await apiClient.post(`/api/jobs/${jobId}/close`);
  return normalizeJob(response.data);
}

export async function deleteJob(jobId: number) {
  return apiClient.delete(`/api/jobs/${jobId}`);
}
