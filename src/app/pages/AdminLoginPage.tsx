import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, ShieldCheck, UserCog } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import { createAdminSession, getAdminSession, normalizeAdminRole, setAdminSession } from "../components/admin/adminSession";
import jhcLogo from "../../imgs/logo.png";
import { extractAuthProfile, loginAdmin } from "../../services/api/authApi";
import { getAxiosErrorMessage } from "../../services/api/utils";

type LoginMode = "super_admin" | "standard_admin";

const inputSt: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #E2E8F0",
  background: "#F8FAFC",
  fontSize: "0.9375rem",
  color: "#0F172A",
  outline: "none",
  fontFamily: "'Sora', system-ui, sans-serif",
  transition: "border-color 0.15s",
};

export default function AdminLoginPage() {
  const existingSession = getAdminSession();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>("super_admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const previousLang = document.documentElement.lang;
    const previousDir = document.documentElement.dir;

    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";

    return () => {
      document.documentElement.lang = previousLang;
      document.documentElement.dir = previousDir;
    };
  }, []);

  if (existingSession) {
    return <Navigate replace to="/admin/overview" />;
  }

  const config: Record<LoginMode, { title: string; description: string; button: string; icon: React.ReactNode }> = {
    super_admin: {
      title: "Super Administrator Login",
      description: "Access full platform administration and security controls.",
      button: "Access Super Dashboard",
      icon: <ShieldCheck size={18} />,
    },
    standard_admin: {
      title: "Administrator Login",
      description: "Access operational dashboards and regional management tools.",
      button: "Access Dashboard",
      icon: <UserCog size={18} />,
    },
  };

  const activeConfig = config[mode];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!email.includes("@")) {
      setError("Please enter a valid official email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim();
      const response = await loginAdmin({ email: trimmedEmail, password });
      const authProfile = extractAuthProfile(response.data);
      const resolvedRole = authProfile.role ? normalizeAdminRole(authProfile.role) : null;

      if (!authProfile.accessToken) {
        setError("Login succeeded, but the backend did not return an access token.");
        return;
      }

      if (!resolvedRole || (mode === "standard_admin" && resolvedRole === "super_admin")) {
        setError("Login succeeded, but the backend did not return a valid administrator role for this account.");
        return;
      }

      setAdminSession(
        createAdminSession({
          email: authProfile.email ?? trimmedEmail,
          accessToken: authProfile.accessToken,
          role: resolvedRole,
          name: authProfile.name,
          region: authProfile.region,
        }),
      );

      navigate("/admin/overview", { replace: true });
    } catch (requestError) {
      setError(getAxiosErrorMessage(requestError, "Unable to sign in right now. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="ltr" lang="en" style={{ fontFamily: "'Sora', system-ui, sans-serif", background: "#F8F9FA", minHeight: "100vh" }}>
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section
            className="hidden rounded-[28px] p-8 lg:flex lg:flex-col lg:justify-between"
            style={{ background: "linear-gradient(160deg,#0B1F4D 0%,#14326F 100%)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div>
              <ImageWithFallback src={jhcLogo} alt="JHC" className="h-10 w-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
              <div className="mt-10 max-w-md">
                <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "rgba(191,219,254,0.85)" }}>
                  Admin Portal
                </span>
                <h1 className="mt-4 text-[2.2rem] font-black leading-tight text-white">
                  Secure access to JHC operational control.
                </h1>
                <p className="mt-4 text-base leading-7" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Use the correct administrator mode to access the dashboards, governance controls, and secure regional operations tools.
                </p>
              </div>
            </div>
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#93C5FD" }}>Authentication Rules</div>
              <div className="mt-3 flex flex-col gap-2 text-sm" style={{ color: "rgba(255,255,255,0.78)" }}>
                <p>Super Admins can access all dashboard sections and security controls.</p>
                <p>Standard Administrators can access only operational and approved settings sections.</p>
                <p>Authentication is secured through the live backend and protected routes.</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-7 lg:p-8" style={{ border: "1px solid #E2E8F0" }}>
            <div className="flex items-center justify-between gap-4">
              <ImageWithFallback src={jhcLogo} alt="JHC" className="h-9 w-auto object-contain lg:hidden" />
              <Link
                to="/"
                className="text-xs font-semibold uppercase tracking-[0.12em] transition-colors"
                style={{ color: "#94A3B8" }}
              >
                Back to Main Site
              </Link>
            </div>

            <div className="mt-6 rounded-2xl p-1" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div className="grid grid-cols-2 gap-1">
                {([
                  { key: "super_admin", label: "Super Admin" },
                  { key: "standard_admin", label: "Standard Administrator" },
                ] as const).map((option) => {
                  const active = mode === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setMode(option.key)}
                      className="rounded-[14px] px-3 py-3 text-sm font-semibold transition-[transform,background-color,color] duration-200 ease-out hover:-translate-y-px active:translate-y-0"
                      style={{
                        background: active ? "#ffffff" : "transparent",
                        color: active ? "#0B1F4D" : "#64748B",
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em]" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                {activeConfig.icon}
                {mode === "super_admin" ? "Secure Access" : "Operational Access"}
              </div>
              <h2 className="mt-4 text-[1.7rem] font-black leading-tight" style={{ color: "#0B1F4D" }}>
                {activeConfig.title}
              </h2>
              <p className="mt-2 text-sm leading-6" style={{ color: "#64748B" }}>
                {activeConfig.description}
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-xl px-4 py-3 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: "#64748B" }}>
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={mode === "super_admin" ? "superadmin@jhc-group.com" : "admin@jhc-group.com"}
                  style={inputSt}
                  onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: "#64748B" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    style={{ ...inputSt, paddingRight: "42px" }}
                    onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#94A3B8", background: "transparent", border: "none", cursor: "pointer" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white transition-[transform,background-color] duration-200 ease-out hover:-translate-y-px active:translate-y-0"
                style={{ background: isSubmitting ? "#94A3B8" : "#0B1F4D", cursor: isSubmitting ? "not-allowed" : "pointer" }}
                onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; }}
                onMouseLeave={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; }}
              >
                {activeConfig.button}
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="mt-6 rounded-2xl p-4 lg:hidden" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "#94A3B8" }}>Secure Session</div>
              <p className="mt-2 text-sm leading-6" style={{ color: "#64748B" }}>
                Select the access level that matches your administrator account before signing in.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
