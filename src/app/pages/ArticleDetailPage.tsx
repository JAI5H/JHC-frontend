import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { AlertCircle, ArrowLeft, BookOpen, Calendar, Clock3, User } from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import jhcLogo from "../../imgs/logo.png";
import { getPublicArticleBySlug, type ArticleRecord } from "../../services/api/articlesApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

function formatDate(value: string | null) {
  if (!value) return "Recently published";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function renderContent(content: string) {
  const elements: React.ReactNode[] = [];
  const lines = content.split("\n");
  let paraLines: string[] = [];

  const flushPara = () => {
    if (!paraLines.length) return;
    elements.push(
      <p key={elements.length} className="mb-7 text-[1.03rem] leading-8 text-[#334155]">
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
        <h3 key={elements.length} className="mb-3 mt-9 text-[1.2rem] font-extrabold leading-8 tracking-[-0.015em] text-[#0B1F4D]">
          {trimmed.slice(4)}
        </h3>,
      );
    } else if (trimmed.startsWith("## ")) {
      flushPara();
      elements.push(
        <h2 key={elements.length} className="mb-5 mt-12 border-b border-[#E2E8F0] pb-3 text-[1.55rem] font-black leading-9 tracking-[-0.025em] text-[#0B1F4D]">
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
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-[380px] animate-pulse rounded-[28px] bg-slate-200" />
      <div className="mx-auto mt-10 max-w-3xl space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-4/5 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
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
    <div style={{ fontFamily: "var(--font-family-app)", background: "#F8FAFC", minHeight: "100vh" }}>
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
        <main className="mx-auto flex min-h-[74vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px]" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
            <AlertCircle size={34} />
          </div>
          <h1 className="mt-6 text-2xl font-black tracking-[-0.03em]" style={{ color: "#0B1F4D" }}>Article not found</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: "#64748B" }}>
            {error || "This article may have been removed or the link may be incorrect."}
          </p>
          <Link to="/articles" className="mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white" style={{ background: "#0B1F4D" }}>
            <ArrowLeft size={14} /> Back to Articles
          </Link>
        </main>
      ) : (
        <main>
          <section className="relative overflow-hidden bg-[#0B1F4D]">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
              }}
            />
            <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_480px] lg:px-8 lg:py-16">
              <div className="flex flex-col justify-center">
                <Link to="/articles" className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-100">
                  <ArrowLeft size={13} /> Articles Library
                </Link>
                <h1 className="max-w-4xl text-[2.2rem] font-black leading-[1.08] tracking-[-0.04em] text-white sm:text-[3.2rem] lg:text-[3.75rem]">
                  {article.title}
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                  {article.summary}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-sm font-semibold text-white/85">
                    <User size={14} style={{ color: "#60A5FA" }} /> {article.author}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-sm font-semibold text-white/72">
                    <Calendar size={14} style={{ color: "#60A5FA" }} /> {formatDate(article.publishedAt)}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-sm font-semibold text-white/72">
                    <Clock3 size={14} style={{ color: "#60A5FA" }} /> {estimateReadTime(article.content)} min read
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] bg-white/8 shadow-[0_28px_90px_rgba(0,0,0,0.28)] ring-1 ring-white/12">
                <div className="aspect-[4/3] bg-[linear-gradient(135deg,#102556_0%,#1D4ED8_100%)]">
                  {article.coverImageUrl ? (
                    <ImageWithFallback src={article.coverImageUrl} alt={article.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen size={56} style={{ color: "rgba(255,255,255,0.48)" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
              <aside className="hidden lg:block">
                <div className="sticky top-24 rounded-[22px] bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
                  <div className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "#94A3B8" }}>Article</div>
                  <div className="mt-3 text-sm font-bold leading-6" style={{ color: "#0B1F4D" }}>{article.title}</div>
                  <div className="mt-4 text-xs leading-5" style={{ color: "#64748B" }}>{formatDate(article.publishedAt)}</div>
                  <Link to="/articles" className="mt-5 inline-flex items-center gap-2 text-xs font-bold" style={{ color: "#1D4ED8" }}>
                    <ArrowLeft size={12} /> All articles
                  </Link>
                </div>
              </aside>

              <article className="min-w-0 rounded-[28px] bg-white px-5 py-8 sm:px-8 lg:px-12 lg:py-12" style={{ border: "1px solid #E2E8F0" }}>
                <div className="mb-10 rounded-[22px] p-6" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderLeft: "4px solid #1D4ED8" }}>
                  <p className="text-[1.05rem] font-semibold leading-8 text-[#334155]">{article.summary}</p>
                </div>

                <div className="mx-auto max-w-3xl">
                  {renderContent(article.content)}
                </div>

                <div className="mx-auto mt-14 flex max-w-3xl flex-col gap-5 border-t border-[#E2E8F0] pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[14px] text-xs font-black" style={{ background: "#1D4ED8", color: "#60A5FA" }}>JA</div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: "#0B1F4D" }}>{article.author}</div>
                      <div className="mt-0.5 text-xs" style={{ color: "#94A3B8" }}>Published {formatDate(article.publishedAt)}</div>
                    </div>
                  </div>
                  <Link to="/articles" className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                    <ArrowLeft size={13} /> Back to Articles
                  </Link>
                </div>
              </article>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
