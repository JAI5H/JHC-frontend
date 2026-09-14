import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, Edit3, FileText, Globe, Plus, Search, Trash2, EyeOff } from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { hasAdminAccessToken } from "../components/admin/adminSession";
import {
  deleteArticle,
  getAdminArticles,
  publishArticle,
  unpublishArticle,
  type ArticleRecord,
} from "../../services/api/articlesApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

type StatusFilter = "all" | "published" | "draft";

function formatDate(value: string | null) {
  if (!value) return "Not published";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: published ? "#F0FDF4" : "#F8FAFC", color: published ? "#16A34A" : "#64748B" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: published ? "#16A34A" : "#94A3B8" }} />
      {published ? "Published" : "Draft"}
    </span>
  );
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);

  const publishedCount = articles.filter((article) => article.isPublished).length;
  const draftCount = articles.length - publishedCount;

  const filteredArticles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesStatus =
        status === "all" ||
        (status === "published" && article.isPublished) ||
        (status === "draft" && !article.isPublished);
      const matchesSearch =
        !normalizedSearch ||
        article.title.toLowerCase().includes(normalizedSearch) ||
        article.summary.toLowerCase().includes(normalizedSearch) ||
        article.slug.toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [articles, search, status]);

  const loadArticles = async (signal?: AbortSignal) => {
    if (!hasAdminAccessToken()) {
      setArticles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getAdminArticles({ pageNumber: 1, pageSize: 100 }, { signal });
      if (signal?.aborted) return;
      setArticles(result.items);
    } catch (requestError) {
      if (isRequestCanceled(requestError) || signal?.aborted) return;
      setError(getAxiosErrorMessage(requestError, "Unable to load articles right now."));
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void loadArticles(controller.signal);
    return () => controller.abort();
  }, []);

  const handleTogglePublish = async (article: ArticleRecord) => {
    setActionId(article.id);
    setError("");
    setFeedback("");
    try {
      if (article.isPublished) {
        await unpublishArticle(article.id);
      } else {
        await publishArticle(article.id);
      }
      setArticles((current) =>
        current.map((item) =>
          item.id === article.id
            ? { ...item, isPublished: !article.isPublished, publishedAt: article.isPublished ? null : new Date().toISOString() }
            : item,
        ),
      );
      setFeedback(article.isPublished ? "Article moved to draft." : "Article published successfully.");
    } catch (requestError) {
      setError(getAxiosErrorMessage(requestError, "Unable to update article status right now."));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (article: ArticleRecord) => {
    if (!window.confirm(`Delete "${article.title}"?`)) return;
    setActionId(article.id);
    setError("");
    setFeedback("");
    try {
      await deleteArticle(article.id);
      setArticles((current) => current.filter((item) => item.id !== article.id));
      setFeedback("Article deleted successfully.");
    } catch (requestError) {
      setError(getAxiosErrorMessage(requestError, "Unable to delete article right now."));
    } finally {
      setActionId(null);
    }
  };

  return (
    <AdminLayout title="Articles">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-black" style={{ color: "#0B1F4D", letterSpacing: "-0.02em" }}>Article Management</h2>
            <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Create, edit, publish, and archive JHC articles.</p>
          </div>
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors"
            style={{ background: "#0B1F4D" }}
          >
            <Plus size={15} /> New Article
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Articles", value: articles.length, color: "#0B1F4D" },
            { label: "Published", value: publishedCount, color: "#16A34A" },
            { label: "Drafts", value: draftCount, color: "#D97706" },
          ].map((metric) => (
            <div key={metric.label} className="rounded-xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>{metric.label}</div>
              <div className="mt-3 text-3xl font-black" style={{ color: metric.color }}>{isLoading ? "..." : metric.value}</div>
            </div>
          ))}
        </div>

        {(error || feedback) ? (
          <div
            className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm"
            style={{
              background: error ? "#FEF2F2" : "#F0FDF4",
              border: error ? "1px solid #FCA5A5" : "1px solid #BBF7D0",
              color: error ? "#DC2626" : "#15803D",
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            {error || feedback}
          </div>
        ) : null}

        <div className="rounded-xl bg-white" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex flex-col gap-3 border-b px-5 py-4 md:flex-row md:items-center" style={{ borderColor: "#E2E8F0" }}>
            <div className="relative flex-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search articles..."
                className="w-full rounded-lg py-2 pl-9 pr-3 text-sm outline-none"
                style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A" }}
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A" }}
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm" style={{ color: "#94A3B8" }}>Loading articles...</div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <FileText size={28} style={{ color: "#94A3B8" }} />
              <div>
                <div className="font-semibold" style={{ color: "#0B1F4D" }}>No articles found</div>
                <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Create your first article or adjust the current filters.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                    {["Article", "Status", "Published", "Author", "Actions"].map((heading) => (
                      <th key={heading} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ background: "#F8FAFC", color: "#94A3B8" }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article, index) => (
                    <tr key={article.id} style={{ borderBottom: index < filteredArticles.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                      <td className="max-w-[520px] px-5 py-4">
                        <div className="font-semibold" style={{ color: "#0B1F4D" }}>{article.title}</div>
                        <div className="mt-1 truncate text-xs" style={{ color: "#64748B" }}>{article.summary}</div>
                        <div className="mt-1 text-xs" style={{ color: "#94A3B8" }}>/articles/{article.slug}</div>
                      </td>
                      <td className="px-5 py-4"><StatusPill published={article.isPublished} /></td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#64748B" }}>{formatDate(article.publishedAt)}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#64748B" }}>{article.author}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/admin/articles/${article.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}>
                            <Edit3 size={12} /> Edit
                          </Link>
                          <button
                            type="button"
                            disabled={actionId === article.id}
                            onClick={() => void handleTogglePublish(article)}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                            style={{ borderColor: article.isPublished ? "#FDE68A" : "#BBF7D0", color: article.isPublished ? "#D97706" : "#16A34A" }}
                          >
                            {article.isPublished ? <EyeOff size={12} /> : <Globe size={12} />}
                            {article.isPublished ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            type="button"
                            disabled={actionId === article.id}
                            onClick={() => void handleDelete(article)}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                            style={{ borderColor: "#FCA5A5", color: "#DC2626" }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
