import { apiClient } from "./client";
import {
  getBooleanValue,
  getListPayload,
  getNumberValue,
  getObjectCandidate,
  getStringValue,
} from "./utils";

type RequestOptions = {
  signal?: AbortSignal;
};

export type ArticleListQuery = {
  search?: string;
  isPublished?: boolean;
  pageNumber?: number;
  pageSize?: number;
};

export type ArticleRecord = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  author: string;
  createdByAdminId?: number;
  createdByAdminName?: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SaveArticleRequest = {
  title: string;
  slug?: string;
  summary: string;
  content: string;
  coverImage?: File | null;
  isPublished?: boolean;
  removeCoverImage?: boolean;
};

function unwrapData(payload: unknown) {
  const envelope = getObjectCandidate(payload);
  return getObjectCandidate(envelope?.data) ?? envelope;
}

function normalizeArticle(payload: unknown): ArticleRecord {
  const record = unwrapData(payload);
  const createdByAdminName = getStringValue(record, ["createdByAdminName"]);
  const author = getStringValue(record, ["author"]) ?? createdByAdminName ?? "JHC Admin";

  return {
    id: getNumberValue(record, ["id", "articleId"]) ?? 0,
    title: getStringValue(record, ["title"]) ?? "",
    slug: getStringValue(record, ["slug"]) ?? "",
    summary: getStringValue(record, ["summary"]) ?? "",
    content: getStringValue(record, ["content"]) ?? "",
    coverImageUrl: getStringValue(record, ["coverImageUrl", "coverImage"]) ?? null,
    isPublished: getBooleanValue(record, ["isPublished", "published"]) ?? Boolean(getStringValue(record, ["publishedAt"])),
    publishedAt: getStringValue(record, ["publishedAt"]) ?? null,
    author,
    createdByAdminId: getNumberValue(record, ["createdByAdminId"]) ?? undefined,
    createdByAdminName: createdByAdminName ?? undefined,
    createdAt: getStringValue(record, ["createdAt"]) ?? null,
    updatedAt: getStringValue(record, ["updatedAt"]) ?? null,
  };
}

function toFormData(payload: SaveArticleRequest, mode: "create" | "update") {
  const formData = new FormData();

  formData.append("Title", payload.title);
  if (payload.slug?.trim()) {
    formData.append("Slug", payload.slug.trim());
  }
  formData.append("Summary", payload.summary);
  formData.append("Content", payload.content);

  if (payload.coverImage) {
    formData.append("CoverImage", payload.coverImage);
  }

  if (mode === "create") {
    formData.append("IsPublished", String(Boolean(payload.isPublished)));
  } else {
    formData.append("RemoveCoverImage", String(Boolean(payload.removeCoverImage)));
  }

  return formData;
}

function buildArticleParams(query: ArticleListQuery) {
  return {
    Search: query.search || undefined,
    IsPublished: query.isPublished,
    PageNumber: query.pageNumber,
    PageSize: query.pageSize,
  };
}

export async function getPublicArticles(query: ArticleListQuery = {}, options?: RequestOptions) {
  const response = await apiClient.get("/api/articles", {
    signal: options?.signal,
    params: buildArticleParams(query),
  });
  const { items, totalCount } = getListPayload(response.data);
  return {
    items: items.map(normalizeArticle),
    totalCount,
    raw: response.data,
  };
}

export async function getPublicArticleBySlug(slug: string, options?: RequestOptions) {
  const response = await apiClient.get(`/api/articles/${encodeURIComponent(slug)}`, {
    signal: options?.signal,
  });
  return normalizeArticle(response.data);
}

export async function getAdminArticles(query: ArticleListQuery = {}, options?: RequestOptions) {
  const response = await apiClient.get("/api/articles/admin", {
    signal: options?.signal,
    params: buildArticleParams(query),
  });
  const { items, totalCount } = getListPayload(response.data);
  return {
    items: items.map(normalizeArticle),
    totalCount,
    raw: response.data,
  };
}

export async function getAdminArticleById(articleId: number, options?: RequestOptions) {
  const response = await apiClient.get(`/api/articles/admin/${articleId}`, {
    signal: options?.signal,
  });
  return normalizeArticle(response.data);
}

export async function createArticle(payload: SaveArticleRequest) {
  const response = await apiClient.post("/api/articles", toFormData(payload, "create"));
  return normalizeArticle(response.data);
}

export async function updateArticle(articleId: number, payload: SaveArticleRequest) {
  const response = await apiClient.put(`/api/articles/${articleId}`, toFormData(payload, "update"));
  return normalizeArticle(response.data);
}

export async function publishArticle(articleId: number) {
  return apiClient.put(`/api/articles/${articleId}/publish`);
}

export async function unpublishArticle(articleId: number) {
  return apiClient.put(`/api/articles/${articleId}/unpublish`);
}

export async function deleteArticle(articleId: number) {
  return apiClient.delete(`/api/articles/${articleId}`);
}
