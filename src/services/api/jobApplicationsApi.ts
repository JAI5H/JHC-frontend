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

export type ReadyToStart = "Yes" | "No" | "Other";

export type JobApplicationRecord = {
  id: number;
  jobId: number;
  jobTitle: string;
  name: string;
  age: number;
  nationality: string;
  experience: string;
  readyToStart: ReadyToStart | string;
  expectedSalary: string;
  additionalNotes: string | null;
  cvFileName: string;
  cvUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
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
  additionalNotes?: string;
  cv: File;
};

function normalizeApplication(payload: unknown): JobApplicationRecord {
  const record = getObjectCandidate(payload);
  return {
    id: getNumberValue(record, ["id", "applicationId"]) ?? 0,
    jobId: getNumberValue(record, ["jobId"]) ?? 0,
    jobTitle: getStringValue(record, ["jobTitle"]) ?? "",
    name: getStringValue(record, ["name"]) ?? "",
    age: getNumberValue(record, ["age"]) ?? 0,
    nationality: getStringValue(record, ["nationality"]) ?? "",
    experience: getStringValue(record, ["experience"]) ?? "",
    readyToStart: getStringValue(record, ["readyToStart"]) ?? "",
    expectedSalary: getStringValue(record, ["expectedSalary"]) ?? "",
    additionalNotes: getStringValue(record, ["additionalNotes"]) ?? null,
    cvFileName: getStringValue(record, ["cvFileName"]) ?? "",
    cvUrl: getStringValue(record, ["cvUrl"]) ?? null,
    createdAt: getStringValue(record, ["createdAt"]) ?? null,
    updatedAt: getStringValue(record, ["updatedAt"]) ?? null,
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
