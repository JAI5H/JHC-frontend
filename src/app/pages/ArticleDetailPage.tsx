import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, BookOpen, Calendar, User } from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import jhcLogo from "../../imgs/logo.png";
import { getPublicArticleBySlug, type ArticleRecord } from "../../services/api/articlesApi";
import { apiClient } from "../../services/api/client";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

const COVER_GRADIENT = "linear-gradient(135deg, #0B1F4D 0%, #1D4ED8 100%)";

function formatDate(value: string | null) {
  if (!value) return "Recently published";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function getArticleCoverImageSrc(slug: string) {
  const baseUrl = String(apiClient.defaults.baseURL ?? "").replace(/\/$/, "");
  return `${baseUrl}/api/articles/${encodeURIComponent(slug)}/cover-image`;
}

function renderContent(content: string) {
  const elements: React.ReactNode[] = [];
  const lines = content.split("\n");
  let paraLines: string[] = [];

  const flushPara = () => {
    if (!paraLines.length) return;
    elements.push(
      <p key={elements.length} style={{ margin: "0 0 1.5rem 0", color: "#334155", lineHeight: 1.8 }}>
        {paraLines.join(" ")}
      </p>,
    );
    paraLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      flushPara();
      elements.push(
        <h3 key={elements.length} style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0B1F4D", margin: "2rem 0 0.75rem 0", letterSpacing: "-0.01em" }}>
          {trimmed.slice(4)}
        </h3>,
      );
    } else if (trimmed.startsWith("## ")) {
      flushPara();
      elements.push(
        <h2 key={elements.length} style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0B1F4D", margin: "2.5rem 0 1rem 0", letterSpacing: "-0.015em", paddingBottom: "0.5rem", borderBottom: "1px solid #E2E8F0" }}>
          {trimmed.slice(3)}
        </h2>,
      );
    } else if (!trimmed) {
      flushPara();
    } else {
      paraLines.push(trimmed);
    }
  }

  flushPara();
  return elements;
}

function LoadingState() {
  return (
    <main style={{ background: "#ffffff", minHeight: "100vh" }}>
      <div className="h-[360px] animate-pulse" style={{ background: "#F1F5F9" }} />
      <div className="mx-auto max-w-4xl px-6 py-14 lg:px-8">
        <div className="mb-12 h-28 animate-pulse rounded-2xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }} />
        <div className="space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </main>
  );
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadArticle = async () => {
      if (!slug) {
        setError("Article not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const result = await getPublicArticleBySlug(slug, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setArticle(result);
      } catch (requestError) {
        if (isRequestCanceled(requestError) || controller.signal.aborted) return;
        setError(getAxiosErrorMessage(requestError, "Article not found."));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadArticle();
    return () => controller.abort();
  }, [slug]);

  return (
    <div style={{ fontFamily: "var(--font-family-app)", background: "#ffffff", minHeight: "100vh" }}>
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/">
            <ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" />
          </Link>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:border-[#0B1F4D] hover:text-[#0B1F4D]"
            style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          >
            <ArrowLeft size={14} /> Articles
          </Link>
        </div>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : error || !article ? (
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl" style={{ background: "#F1F5F9" }}>
            <BookOpen size={36} style={{ color: "#94A3B8" }} />
          </div>
          <div>
            <h1 className="mb-2 text-2xl font-bold" style={{ color: "#0B1F4D" }}>Article not found</h1>
            <p className="text-sm" style={{ color: "#64748B" }}>
              {error || "This article may have been removed or the link may be incorrect."}
            </p>
          </div>
          <Link to="/articles" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white" style={{ background: "#0B1F4D" }}>
            <ArrowLeft size={14} /> Back to Articles
          </Link>
        </main>
      ) : (
        <>
          <div
            className="relative flex w-full items-end"
            style={{
              background: article.coverImageUrl ? "transparent" : COVER_GRADIENT,
              minHeight: 360,
            }}
          >
            {article.coverImageUrl ? (
              <ImageWithFallback src={getArticleCoverImageSrc(article.slug)} alt={article.title} className="absolute inset-0 h-full w-full object-cover" />
            ) : null}
            <div
              className="absolute inset-0"
              style={{ background: article.coverImageUrl ? "linear-gradient(to top, rgba(11,31,77,0.85) 0%, rgba(11,31,77,0.25) 60%, transparent 100%)" : "none" }}
            />
            {!article.coverImageUrl ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen size={60} style={{ color: "rgba(255,255,255,0.16)" }} />
              </div>
            ) : null}
            <div className="relative mx-auto w-full max-w-4xl px-6 pb-14 pt-32 lg:px-8">
              <Link to="/articles" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold transition-colors" style={{ color: "rgba(255,255,255,0.65)" }}>
                <ArrowLeft size={13} /> Back to Articles
              </Link>
              <h1
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  maxWidth: 720,
                }}
              >
                {article.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{ background: "#1D4ED8", color: "#60A5FA" }}>
                    JA
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{article.author}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                  <Calendar size={13} />
                  {formatDate(article.publishedAt)}
                </div>
              </div>
            </div>
          </div>

          <main className="mx-auto max-w-4xl px-6 py-14 lg:px-8">
            <div className="mb-12 rounded-2xl p-7" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderLeft: "4px solid #1D4ED8" }}>
              <p className="text-base font-medium leading-relaxed" style={{ color: "#334155" }}>
                {article.summary}
              </p>
            </div>

            <article style={{ fontSize: "1rem" }}>
              {renderContent(article.content)}
            </article>

            <div className="mt-16 flex items-center justify-between gap-4 border-t pt-8" style={{ borderColor: "#E2E8F0" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold" style={{ background: "#1D4ED8", color: "#60A5FA" }}>
                  JA
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#0B1F4D" }}>
                    <User size={11} className="mr-1 inline" style={{ color: "#94A3B8" }} />
                    {article.author}
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: "#94A3B8" }}>
                    Published {formatDate(article.publishedAt)}
                  </div>
                </div>
              </div>
              <Link to="/articles" className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                <ArrowLeft size={13} /> All Articles
              </Link>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
