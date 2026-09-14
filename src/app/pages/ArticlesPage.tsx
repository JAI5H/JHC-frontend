import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, ArrowLeft, BookOpen, Calendar, Search, Sparkles } from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import jhcLogo from "../../imgs/logo.png";
import { getPublicArticles, type ArticleRecord } from "../../services/api/articlesApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

function formatDate(value: string | null) {
  if (!value) return "Recently published";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function ArticleCard({ article, featured = false }: { article: ArticleRecord; featured?: boolean }) {
  return (
    <Link
      to={`/articles/${article.slug}`}
      className={[
        "group grid overflow-hidden rounded-[22px] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]",
        featured ? "lg:grid-cols-[1.05fr_0.95fr]" : "",
      ].join(" ")}
      style={{ border: "1px solid #E2E8F0" }}
    >
      <div className={featured ? "min-h-[260px] lg:min-h-full" : "h-52"} style={{ background: "#0B1F4D" }}>
        {article.coverImageUrl ? (
          <ImageWithFallback
            src={article.coverImageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#0B1F4D_0%,#12336F_58%,#1D4ED8_100%)]">
            <BookOpen size={featured ? 48 : 34} style={{ color: "rgba(255,255,255,0.52)" }} />
          </div>
        )}
      </div>

      <div className={featured ? "flex flex-col justify-center p-7 lg:p-9" : "p-6"}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
            <BookOpen size={12} /> Article
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#94A3B8" }}>
            <Calendar size={12} /> {formatDate(article.publishedAt)}
          </span>
        </div>
        <h2
          className={featured ? "text-[1.75rem] font-black leading-tight lg:text-[2.15rem]" : "text-xl font-extrabold leading-snug"}
          style={{ color: "#0B1F4D", letterSpacing: "-0.025em" }}
        >
          {article.title}
        </h2>
        <p className={featured ? "mt-4 line-clamp-4 text-base leading-8" : "mt-3 line-clamp-3 text-sm leading-6"} style={{ color: "#64748B" }}>
          {article.summary}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold" style={{ color: "#1D4ED8" }}>
          Read article
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[22px] bg-white" style={{ border: "1px solid #E2E8F0" }}>
          <div className="h-52 animate-pulse bg-slate-200" />
          <div className="space-y-3 p-6">
            <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
            <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadArticles = async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await getPublicArticles({ isPublished: true, pageNumber: 1, pageSize: 100 }, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setArticles(result.items);
      } catch (requestError) {
        if (isRequestCanceled(requestError) || controller.signal.aborted) return;
        setError(getAxiosErrorMessage(requestError, "Unable to load articles right now."));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadArticles();
    return () => controller.abort();
  }, []);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return articles.filter((article) =>
      !query ||
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      article.slug.toLowerCase().includes(query),
    );
  }, [articles, search]);

  const featuredArticle = filteredArticles[0] ?? null;
  const remainingArticles = featuredArticle ? filteredArticles.slice(1) : filteredArticles;

  return (
    <div style={{ fontFamily: "var(--font-family-app)", background: "#F8FAFC", minHeight: "100vh" }}>
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:border-[#0B1F4D] hover:text-[#0B1F4D]"
            style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          >
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#0B1F4D] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
                <Sparkles size={13} /> JHC Articles Library
              </div>
              <h1 className="mt-6 text-[2.45rem] font-black leading-[1.06] tracking-[-0.04em] sm:text-[3.4rem] lg:text-[4rem]">
                Insights for human capital leaders
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                Practical perspectives on workforce strategy, recruitment execution, operations, and GCC market growth.
              </p>
            </div>

            <div className="mt-10 rounded-[22px] bg-white p-3 shadow-[0_24px_80px_rgba(0,0,0,0.18)] lg:max-w-3xl">
              <div className="relative">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, summary, or topic..."
                  className="h-14 w-full rounded-[16px] bg-[#F8FAFC] pl-12 pr-4 text-sm font-medium outline-none transition-colors focus:bg-white"
                  style={{ border: "1px solid #E2E8F0", color: "#0F172A" }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-black tracking-[-0.03em]" style={{ color: "#0B1F4D" }}>Latest thinking</h2>
              <p className="mt-1 text-sm" style={{ color: "#64748B" }}>
                {isLoading ? "Fetching published articles..." : `${filteredArticles.length} article${filteredArticles.length === 1 ? "" : "s"} available`}
              </p>
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-3 rounded-[18px] bg-white px-5 py-4 text-sm" style={{ border: "1px solid #FCA5A5", color: "#DC2626" }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          ) : null}

          {isLoading ? (
            <LoadingGrid />
          ) : filteredArticles.length === 0 ? (
            <div className="rounded-[24px] bg-white px-6 py-20 text-center" style={{ border: "1px solid #E2E8F0" }}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                <BookOpen size={28} />
              </div>
              <h3 className="mt-5 text-lg font-black" style={{ color: "#0B1F4D" }}>No articles found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: "#64748B" }}>
                Try a different search term or clear the search field to see all published JHC articles.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {featuredArticle ? <ArticleCard article={featuredArticle} featured /> : null}
              {remainingArticles.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {remainingArticles.map((article) => <ArticleCard key={article.id} article={article} />)}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
