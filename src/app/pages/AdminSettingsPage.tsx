import { useState } from "react";
import {
  Save,
  User,
  Settings2,
  ChevronDown,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { getAdminSession, isSuperAdmin } from "../components/admin/adminSession";

type Tab = "profile" | "system";

const TABS: { key: Tab; icon: React.ReactNode; label: string }[] = [
  { key: "profile", icon: <User size={15} />,     label: "Profile Settings"              },
  { key: "system",  icon: <Settings2 size={15} />, label: "System Configurations"        },
];

const REGIONS = ["All Regions", "GCC & Egypt Hubs", "Saudi Arabia Hub", "Egypt Hub", "UAE Hub", "Qatar Hub", "Kuwait Hub"];

const inputSt: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid #E2E8F0", background: "#F8FAFC",
  fontSize: "0.875rem", color: "#0F172A", outline: "none",
  fontFamily: "'Sora', system-ui, sans-serif", transition: "border-color 0.15s",
};

const disabledSt: React.CSSProperties = {
  ...inputSt, background: "#F1F5F9", color: "#94A3B8", cursor: "not-allowed",
};

const labelSt: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748B",
  marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={labelSt}>{label}</label>
      {children}
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{ ...inputSt, paddingRight: "40px" }}
        onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", outline: "none", border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "flex" }}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function StrengthBar({ password }: { password: string }) {
  if (!password) return null;

  const strength = Math.min(
    4,
    (password.length >= 8 ? 1 : 0) +
      (/[A-Z]/.test(password) ? 1 : 0) +
      (/[0-9]/.test(password) ? 1 : 0) +
      (/[^A-Za-z0-9]/.test(password) ? 1 : 0),
  );
  const colors = ["#E2E8F0", "#DC2626", "#D97706", "#16A34A", "#1D4ED8"];
  const labels = ["", "Too short", "Weak", "Good", "Strong"];

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4].map((level) => (
        <div key={level} className="h-1 flex-1 rounded-full" style={{ background: level <= strength ? colors[strength] : "#E2E8F0" }} />
      ))}
      <span className="whitespace-nowrap text-xs" style={{ color: "#64748B" }}>{labels[strength]}</span>
    </div>
  );
}

function ProfileTab() {
  const session = getAdminSession();
  const superAdmin = session ? isSuperAdmin(session.role) : false;
  const [form, setForm] = useState({ name: "JHC Admin", email: "admin@jhc-group.com", region: "GCC & Egypt Hubs" });
  const [emailForm, setEmailForm] = useState({ currentPassword: "", newEmail: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [adminForm, setAdminForm] = useState({
    fullName: "",
    adminEmail: "",
    newPassword: "",
    confirmPassword: "",
    currentPassword: "",
  });
  const [accountError, setAccountError] = useState("");
  const [saved, setSaved] = useState(false);
  const [accountSaved, setAccountSaved] = useState<"" | "email" | "password" | "admin">("");

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };
  const saveAccountSection = (section: "email" | "password" | "admin") => {
    let error = "";

    if (section === "email") {
      if (!emailForm.currentPassword) error = "Current password is required.";
      else if (!emailForm.newEmail || !emailForm.newEmail.includes("@")) error = "Enter a valid email address.";
    }

    if (section === "password") {
      if (!passwordForm.currentPassword) error = "Current password is required.";
      else if (passwordForm.newPassword.length < 8) error = "New password must be at least 8 characters.";
      else if (passwordForm.newPassword !== passwordForm.confirmPassword) error = "Passwords do not match.";
    }

    if (section === "admin") {
      if (!adminForm.fullName.trim()) error = "Administrator full name is required.";
      else if (!adminForm.adminEmail || !adminForm.adminEmail.includes("@")) error = "Enter a valid email for the new admin.";
      else if (adminForm.newPassword.length < 8) error = "New admin password must be at least 8 characters.";
      else if (adminForm.newPassword !== adminForm.confirmPassword) error = "Passwords do not match.";
      else if (!adminForm.currentPassword) error = "Your current password is required to authorize this action.";
    }

    if (error) {
      setAccountSaved("");
      setAccountError(error);
      return;
    }

    setAccountError("");
    setAccountSaved(section);
    setTimeout(() => setAccountSaved(""), 2200);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>Profile Settings</h3>
        <p className="text-sm mt-1" style={{ color: "#64748B" }}>Manage your admin account information and regional target.</p>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-5 p-5 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold flex-shrink-0" style={{ background: "#1D4ED8", color: "#60A5FA" }}>JA</div>
        <div>
          <div className="font-semibold" style={{ color: "#0B1F4D" }}>{session?.name ?? "JHC Admin"}</div>
          <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>
            {superAdmin ? "Super Administrator" : "Standard Administrator"} · {session?.region ?? "GCC & Egypt Hubs"}
          </div>
        </div>
        <button className="ml-auto text-xs font-semibold px-4 py-2 rounded-lg border transition-colors" style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}>
          Change Avatar
        </button>
      </div>

      {/* Form */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label style={labelSt}>Admin Full Name</label>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            style={inputSt} onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
        </div>
        <div>
          <label style={labelSt}>Official Contact Email</label>
          <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            style={inputSt} onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
        </div>
        <div>
          <label style={labelSt}>System Role Access Level</label>
          <input value={superAdmin ? "Super Administrator" : "Standard Administrator"} disabled style={disabledSt} />
          <p className="text-xs mt-1.5" style={{ color: "#94A3B8" }}>Role is set by the system. Contact support to modify.</p>
        </div>
        <div>
          <label style={labelSt}>Primary Region Target</label>
          <div className="relative">
            <select value={form.region} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
              style={{ ...inputSt, cursor: "pointer", appearance: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#94A3B8" }} />
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="pt-4 border-t flex items-center justify-between gap-4" style={{ borderColor: "#E2E8F0" }}>
        {saved && (
          <span className="text-sm font-medium" style={{ color: "#16A34A" }}>✓ Preferences saved successfully</span>
        )}
        {!saved && <span />}
        <button onClick={save}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: "#1D4ED8" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}>
          <Save size={14} /> Save Preferences
        </button>
      </div>

      {accountError && (
        <div className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          {accountError}
        </div>
      )}

      {superAdmin && (
        <>
          <div className="border-t pt-8" style={{ borderColor: "#E2E8F0" }}>
            <div>
              <h3 className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>Account Configuration</h3>
              <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Manage account-level security and access directly from this page.</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl p-5" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div className="mb-5">
                <h4 className="font-semibold" style={{ color: "#0B1F4D" }}>Change Email</h4>
                <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Update the official admin inbox used for access and notifications.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Current Password">
                  <PasswordInput value={emailForm.currentPassword} onChange={(value) => setEmailForm((prev) => ({ ...prev, currentPassword: value }))} placeholder="Enter current password to verify" />
                </Field>
                <Field label="New Email Address">
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(event) => setEmailForm((prev) => ({ ...prev, newEmail: event.target.value }))}
                    placeholder="Enter the new admin email"
                    style={inputSt}
                    onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </Field>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4" style={{ borderColor: "#E2E8F0" }}>
                <span className="text-xs" style={{ color: accountSaved === "email" ? "#16A34A" : "#94A3B8" }}>
                  {accountSaved === "email" ? "✓ Email address updated successfully" : "A verification link will be sent before the change takes effect."}
                </span>
                <button
                  onClick={() => saveAccountSection("email")}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                  style={{ background: "#1D4ED8" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
                >
                  <Save size={14} /> Save Email
                </button>
              </div>
            </div>

            <div className="rounded-xl p-5" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div className="mb-5">
                <h4 className="font-semibold" style={{ color: "#0B1F4D" }}>Change Password</h4>
                <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Strengthen account security with a new password.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Current Password">
                  <PasswordInput value={passwordForm.currentPassword} onChange={(value) => setPasswordForm((prev) => ({ ...prev, currentPassword: value }))} placeholder="Enter your current password" />
                </Field>
                <div className="sm:col-span-2 grid gap-5 sm:grid-cols-2">
                  <div>
                    <Field label="New Password">
                      <PasswordInput value={passwordForm.newPassword} onChange={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))} placeholder="Min. 8 characters" />
                    </Field>
                    <div className="mt-3">
                      <StrengthBar password={passwordForm.newPassword} />
                    </div>
                  </div>
                  <Field label="Confirm New Password">
                    <PasswordInput value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm((prev) => ({ ...prev, confirmPassword: value }))} placeholder="Re-enter new password" />
                  </Field>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4" style={{ borderColor: "#E2E8F0" }}>
                <span className="text-xs" style={{ color: accountSaved === "password" ? "#16A34A" : "#94A3B8" }}>
                  {accountSaved === "password" ? "✓ Password changed successfully" : "Use a strong password with letters, numbers, and symbols."}
                </span>
                <button
                  onClick={() => saveAccountSection("password")}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                  style={{ background: "#1D4ED8" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
                >
                  <Save size={14} /> Save Password
                </button>
              </div>
            </div>

            <div className="rounded-xl p-5" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div className="mb-5">
                <h4 className="font-semibold" style={{ color: "#0B1F4D" }}>Add New Administrator</h4>
                <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Create a Standard Administrator account with global operational visibility.</p>
              </div>
              <div className="mb-5 flex items-start gap-3 rounded-lg px-4 py-3" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                <ShieldCheck size={15} style={{ color: "#1D4ED8", flexShrink: 0, marginTop: "1px" }} />
                <p className="text-xs leading-relaxed" style={{ color: "#1D4ED8" }}>
                  Every account created here is automatically assigned the Standard Administrator role. Access is limited by system permissions and currently includes global platform visibility.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Administrator Full Name">
                  <input
                    type="text"
                    value={adminForm.fullName}
                    onChange={(event) => setAdminForm((prev) => ({ ...prev, fullName: event.target.value }))}
                    placeholder="Enter the administrator's full name"
                    style={inputSt}
                    onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </Field>
                <Field label="Official Administrator Email">
                  <input
                    type="email"
                    value={adminForm.adminEmail}
                    onChange={(event) => setAdminForm((prev) => ({ ...prev, adminEmail: event.target.value }))}
                    placeholder="Enter the administrator email"
                    style={inputSt}
                    onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </Field>
                <div>
                  <Field label="Initial Password">
                    <PasswordInput value={adminForm.newPassword} onChange={(value) => setAdminForm((prev) => ({ ...prev, newPassword: value }))} placeholder="Min. 8 characters" />
                  </Field>
                  <div className="mt-3">
                    <StrengthBar password={adminForm.newPassword} />
                  </div>
                </div>
                <Field label="Confirm Password">
                  <PasswordInput value={adminForm.confirmPassword} onChange={(value) => setAdminForm((prev) => ({ ...prev, confirmPassword: value }))} placeholder="Re-enter password" />
                </Field>
                <div className="sm:col-span-2">
                  <p className="mb-5 text-sm" style={{ color: "#64748B" }}>
                    Administrator accounts are created with restricted operational access.
                  </p>
                  <Field label="Your Current Password">
                    <PasswordInput value={adminForm.currentPassword} onChange={(value) => setAdminForm((prev) => ({ ...prev, currentPassword: value }))} placeholder="Authorize this action" />
                  </Field>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4" style={{ borderColor: "#E2E8F0" }}>
                <span className="text-xs" style={{ color: accountSaved === "admin" ? "#16A34A" : "#94A3B8" }}>
                  {accountSaved === "admin" ? "✓ Standard Administrator account created successfully" : "Administrator creation requires your current password for security confirmation."}
                </span>
                <button
                  onClick={() => saveAccountSection("admin")}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                  style={{ background: "#1D4ED8" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
                >
                  <UserPlus size={14} /> Create Administrator Account
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {!superAdmin && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl p-5" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <div className="mb-5">
              <h4 className="font-semibold" style={{ color: "#0B1F4D" }}>Change Email</h4>
              <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Update the official admin inbox used for access and notifications.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Current Password">
                <PasswordInput value={emailForm.currentPassword} onChange={(value) => setEmailForm((prev) => ({ ...prev, currentPassword: value }))} placeholder="Enter current password to verify" />
              </Field>
              <Field label="New Email Address">
                <input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(event) => setEmailForm((prev) => ({ ...prev, newEmail: event.target.value }))}
                  placeholder="Enter your new email"
                  style={inputSt}
                  onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </Field>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4" style={{ borderColor: "#E2E8F0" }}>
              <span className="text-xs" style={{ color: accountSaved === "email" ? "#16A34A" : "#94A3B8" }}>
                {accountSaved === "email" ? "✓ Email address updated successfully" : "A verification link will be sent before the change takes effect."}
              </span>
              <button
                onClick={() => saveAccountSection("email")}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                style={{ background: "#1D4ED8" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
              >
                <Save size={14} /> Save Email
              </button>
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <div className="mb-5">
              <h4 className="font-semibold" style={{ color: "#0B1F4D" }}>Change Password</h4>
              <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Strengthen account security with a new password.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Current Password">
                <PasswordInput value={passwordForm.currentPassword} onChange={(value) => setPasswordForm((prev) => ({ ...prev, currentPassword: value }))} placeholder="Enter your current password" />
              </Field>
              <div className="sm:col-span-2 grid gap-5 sm:grid-cols-2">
                <div>
                  <Field label="New Password">
                    <PasswordInput value={passwordForm.newPassword} onChange={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))} placeholder="Min. 8 characters" />
                  </Field>
                  <div className="mt-3">
                    <StrengthBar password={passwordForm.newPassword} />
                  </div>
                </div>
                <Field label="Confirm New Password">
                  <PasswordInput value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm((prev) => ({ ...prev, confirmPassword: value }))} placeholder="Re-enter new password" />
                </Field>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4" style={{ borderColor: "#E2E8F0" }}>
              <span className="text-xs" style={{ color: accountSaved === "password" ? "#16A34A" : "#94A3B8" }}>
                {accountSaved === "password" ? "✓ Password changed successfully" : "Use a strong password with letters, numbers, and symbols."}
              </span>
              <button
                onClick={() => saveAccountSection("password")}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                style={{ background: "#1D4ED8" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
              >
                <Save size={14} /> Save Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SystemTab() {
  const [vals, setVals] = useState({
    sessionTimeout: "30",
    maxUploadMB: "5",
  });
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>System Configurations</h3>
        <p className="text-sm mt-1" style={{ color: "#64748B" }}>Control platform-wide behavior, security, and defaults.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label style={labelSt}>Session Timeout (minutes)</label>
          <input type="number" value={vals.sessionTimeout} onChange={(e) => setVals((p) => ({ ...p, sessionTimeout: e.target.value }))}
            style={inputSt} onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
        </div>
        <div>
          <label style={labelSt}>Max CV Upload Size (MB)</label>
          <input type="number" value={vals.maxUploadMB} disabled style={disabledSt} />
          <p className="text-xs mt-1.5" style={{ color: "#94A3B8" }}>
            Maximum CV size is managed by the backend and currently limited to 5 MB.
          </p>
        </div>
      </div>
      <div className="pt-4 border-t flex justify-end" style={{ borderColor: "#E2E8F0" }}>
        <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: "#1D4ED8" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}>
          <Save size={14} /> Save System Config
        </button>
      </div>
    </div>
  );
}

function PricingTab() {
  // Future feature: Pricing & Fees module temporarily disabled.
  const TIERS = [
    { market: "Saudi Arabia 🇸🇦", base: "$4,500", remote: "$2,800", recruit: "$3,200" },
    { market: "Egypt 🇪🇬",         base: "$2,200", remote: "$1,400", recruit: "$1,800" },
    { market: "UAE 🇦🇪",           base: "$5,200", remote: "$3,100", recruit: "$3,900" },
    { market: "Qatar 🇶🇦",         base: "$4,800", remote: "$2,950", recruit: "$3,500" },
    { market: "Kuwait 🇰🇼",        base: "$4,200", remote: "$2,600", recruit: "$3,100" },
    { market: "Bahrain 🇧🇭",       base: "$3,800", remote: "$2,300", recruit: "$2,700" },
  ];
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>GCC Regional Pricing & Fees</h3>
        <p className="text-sm mt-1" style={{ color: "#64748B" }}>Monthly base rates per market for JHC service tiers (USD).</p>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
              {["Market","Operations Mgmt","Remote Workforce","Recruitment"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#94A3B8", background: "#F8FAFC", letterSpacing: "0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIERS.map((row, i) => (
              <tr key={row.market} style={{ borderBottom: i < TIERS.length - 1 ? "1px solid #F1F5F9" : "none" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFBFC")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                <td className="px-5 py-3 text-sm font-semibold" style={{ color: "#0B1F4D" }}>{row.market}</td>
                {[row.base, row.remote, row.recruit].map((val, vi) => (
                  <td key={vi} className="px-5 py-3">
                    <span className="text-sm font-mono font-semibold" style={{ color: "#1D4ED8" }}>{val}</span>
                    <span className="text-xs ml-1" style={{ color: "#94A3B8" }}>/mo</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pt-4 border-t flex justify-end" style={{ borderColor: "#E2E8F0" }}>
        <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: "#1D4ED8" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}>
          <Save size={14} /> Save Pricing
        </button>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <AdminLayout title="Settings">
      <div className="flex flex-col gap-5">
        {/* Tab bar */}
        <div className="rounded-xl bg-white flex overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
          {TABS.map((t, i) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex items-center gap-2.5 flex-1 justify-center px-5 py-3.5 text-sm font-medium transition-all duration-150"
                style={{
                  background: active ? "#EFF6FF" : "transparent",
                  color: active ? "#1D4ED8" : "#64748B",
                  borderRight: i < TABS.length - 1 ? "1px solid #E2E8F0" : "none",
                  borderBottom: active ? "2px solid #1D4ED8" : "2px solid transparent",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:block">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="rounded-xl bg-white p-7 lg:p-9" style={{ border: "1px solid #E2E8F0" }}>
          {tab === "profile" && <ProfileTab />}
          {tab === "system"  && <SystemTab />}
        </div>
      </div>
    </AdminLayout>
  );
}
