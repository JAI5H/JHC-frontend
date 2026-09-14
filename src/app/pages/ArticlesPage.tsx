import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, BookOpen, Calendar, Search } from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import jhcLogo from "../../imgs/logo.png";
import { getPublicArticles, type ArticleRecord } from "../../services/api/articlesApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

function formatDate(value: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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
        const result = await getPublicArticles({ pageNumber: 1, pageSize: 100 }, { signal: controller.signal });
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

  const filteredArticles = articles.filter((article) => {
    const query = search.trim().toLowerCase();
    return !query || article.title.toLowerCase().includes(query) || article.summary.toLowerCase().includes(query);
  });

  return (
    <div style={{ fontFamily: "var(--font-family-app)", background: "#F8FAFC", minHeight: "100vh" }}>
      <header className="sticky top-0 z-40 bg-white" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" />
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="mb-8">
          <div className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
            <BookOpen size={14} className="mr-2" /> JHC Articles
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight" style={{ color: "#0B1F4D", letterSpacing: "-0.03em" }}>Insights for human capital leaders</h1>
          <p className="mt-3 max-w-2xl text-base leading-7" style={{ color: "#64748B" }}>Practical views on workforce strategy, operations, recruitment, and GCC market execution.</p>
        </section>

        <div className="mb-6 rounded-xl bg-white p-4" style={{ border: "1px solid #E2E8F0" }}>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles..." className="w-full rounded-lg py-2.5 pl-10 pr-3 text-sm outline-none" style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A" }} />
          </div>
        </div>

        {error ? <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}>{error}</div> : null}

        {isLoading ? (
          <div className="py-16 text-center text-sm" style={{ color: "#94A3B8" }}>Loading articles...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center" style={{ border: "1px solid #E2E8F0" }}>
            <BookOpen size={28} className="mx-auto mb-4" style={{ color: "#94A3B8" }} />
            <div className="font-semibold" style={{ color: "#0B1F4D" }}>No articles found</div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Link key={article.id} to={`/articles/${article.slug}`} className="group overflow-hidden rounded-xl bg-white transition-transform hover:-translate-y-1" style={{ border: "1px solid #E2E8F0" }}>
                <div className="h-44 bg-[#0B1F4D]">
                  {article.coverImageUrl ? (
                    <ImageWithFallback src={article.coverImageUrl} alt={article.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/50"><BookOpen size={34} /></div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-1.5 text-xs" style={{ color: "#94A3B8" }}><Calendar size={12} /> {formatDate(article.publishedAt)}</div>
                  <h2 className="text-lg font-bold leading-snug group-hover:text-blue-700" style={{ color: "#0B1F4D" }}>{article.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6" style={{ color: "#64748B" }}>{article.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
