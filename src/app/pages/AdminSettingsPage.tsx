import { useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  Settings2,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { getAdminSession, isSuperAdmin, setAdminSession } from "../components/admin/adminSession";
import { changeAdminEmail, changeAdminPassword, addAdministrator } from "../../services/api/settingsApi";
import { getAxiosErrorMessage } from "../../services/api/utils";

type Tab = "profile" | "system";

const TABS: { key: Tab; icon: React.ReactNode; label: string }[] = [
  { key: "profile", icon: <User size={15} />, label: "Profile Settings" },
  { key: "system", icon: <Settings2 size={15} />, label: "System Configurations" },
];

const REGIONS = ["All Regions", "GCC & Egypt Hubs", "Saudi Arabia Hub", "Egypt Hub", "UAE Hub", "Qatar Hub", "Kuwait Hub"];

const inputSt: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #E2E8F0",
  background: "#F8FAFC",
  fontSize: "0.875rem",
  color: "#0F172A",
  outline: "none",
  fontFamily: "'Sora', system-ui, sans-serif",
  transition: "border-color 0.15s",
};

const disabledSt: React.CSSProperties = {
  ...inputSt,
  background: "#F1F5F9",
  color: "#94A3B8",
  cursor: "not-allowed",
};

const labelSt: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#64748B",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
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

function FeedbackBanner({ error, success }: { error: string; success: string }) {
  if (!error && !success) return null;

  const isError = Boolean(error);

  return (
    <div
      className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm"
      style={{
        background: isError ? "#FEF2F2" : "#F0FDF4",
        border: isError ? "1px solid #FCA5A5" : "1px solid #BBF7D0",
        color: isError ? "#DC2626" : "#15803D",
      }}
    >
      <AlertCircle size={14} style={{ flexShrink: 0 }} />
      {error || success}
    </div>
  );
}

function ProfileTab() {
  const session = getAdminSession();
  const superAdmin = session ? isSuperAdmin(session.role) : false;
  const [form, setForm] = useState({ name: session?.name ?? "JHC Admin", email: session?.email ?? "admin@jhc-group.com", region: session?.region ?? "GCC & Egypt Hubs" });
  const [emailForm, setEmailForm] = useState({ currentPassword: "", newEmail: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [adminForm, setAdminForm] = useState({
    fullName: "",
    adminEmail: "",
    newPassword: "",
    confirmPassword: "",
    currentPassword: "",
  });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const handleUnsupportedPreferencesSave = () => {
    setProfileSuccess("");
    setProfileError("No backend endpoint exists for saving profile preferences yet.");
  };

  const handleSaveEmail = async () => {
    setEmailError("");
    setEmailSuccess("");

    if (!emailForm.currentPassword) {
      setEmailError("Current password is required.");
      return;
    }

    if (!emailForm.newEmail || !emailForm.newEmail.includes("@")) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailLoading(true);

    try {
      await changeAdminEmail({
        currentPassword: emailForm.currentPassword,
        newEmail: emailForm.newEmail,
      });

      if (session) {
        setAdminSession({ ...session, email: emailForm.newEmail });
      }

      setForm((current) => ({ ...current, email: emailForm.newEmail }));
      setEmailForm({ currentPassword: "", newEmail: "" });
      setEmailSuccess("Email address updated successfully.");
    } catch (requestError) {
      setEmailError(getAxiosErrorMessage(requestError, "Unable to update email right now."));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      await changeAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSuccess("Password changed successfully.");
    } catch (requestError) {
      setPasswordError(getAxiosErrorMessage(requestError, "Unable to change password right now."));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setAdminError("");
    setAdminSuccess("");

    if (!adminForm.fullName.trim()) {
      setAdminError("Administrator full name is required.");
      return;
    }

    if (!adminForm.adminEmail || !adminForm.adminEmail.includes("@")) {
      setAdminError("Enter a valid email for the new admin.");
      return;
    }

    if (adminForm.newPassword.length < 8) {
      setAdminError("New admin password must be at least 8 characters.");
      return;
    }

    if (adminForm.newPassword !== adminForm.confirmPassword) {
      setAdminError("Passwords do not match.");
      return;
    }

    if (!adminForm.currentPassword) {
      setAdminError("Your current password is required to authorize this action.");
      return;
    }

    setAdminLoading(true);

    try {
      await addAdministrator({
        fullName: adminForm.fullName.trim(),
        email: adminForm.adminEmail.trim(),
        password: adminForm.newPassword,
      });

      setAdminForm({
        fullName: "",
        adminEmail: "",
        newPassword: "",
        confirmPassword: "",
        currentPassword: "",
      });
      setAdminSuccess("Standard Administrator account created successfully.");
    } catch (requestError) {
      setAdminError(getAxiosErrorMessage(requestError, "Unable to create the administrator account right now."));
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>Profile Settings</h3>
        <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Manage your admin account information and regional target.</p>
      </div>

      <div className="flex items-center gap-5 rounded-xl p-5" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-base font-bold" style={{ background: "#1D4ED8", color: "#60A5FA" }}>JA</div>
        <div>
          <div className="font-semibold" style={{ color: "#0B1F4D" }}>{session?.name ?? "JHC Admin"}</div>
          <div className="mt-0.5 text-xs" style={{ color: "#64748B" }}>
            {superAdmin ? "Super Administrator" : "Standard Administrator"} · {session?.region ?? "GCC & Egypt Hubs"}
          </div>
        </div>
        <button className="ml-auto rounded-lg border px-4 py-2 text-xs font-semibold transition-colors" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
          Change Avatar
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label style={labelSt}>Admin Full Name</label>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} style={inputSt} onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
        </div>
        <div>
          <label style={labelSt}>Official Contact Email</label>
          <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} style={inputSt} onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
        </div>
        <div>
          <label style={labelSt}>System Role Access Level</label>
          <input value={superAdmin ? "Super Administrator" : "Standard Administrator"} disabled style={disabledSt} />
          <p className="mt-1.5 text-xs" style={{ color: "#94A3B8" }}>Role is set by the system. Contact support to modify.</p>
        </div>
      </div>

      <FeedbackBanner error={profileError} success={profileSuccess} />

      <div className="flex items-center justify-between gap-4 border-t pt-4" style={{ borderColor: "#E2E8F0" }}>
        <span className="text-sm" style={{ color: "#94A3B8" }}>Profile preferences remain read-only until a matching backend endpoint is available.</span>
        <button
          onClick={handleUnsupportedPreferencesSave}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ background: "#1D4ED8" }}
        >
          <Save size={14} /> Save Preferences
        </button>
      </div>

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
          <FeedbackBanner error={emailError} success={emailSuccess} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Current Password">
              <PasswordInput value={emailForm.currentPassword} onChange={(value) => setEmailForm((current) => ({ ...current, currentPassword: value }))} placeholder="Enter current password to verify" />
            </Field>
            <Field label="New Email Address">
              <input type="email" value={emailForm.newEmail} onChange={(event) => setEmailForm((current) => ({ ...current, newEmail: event.target.value }))} placeholder="Enter the new admin email" style={inputSt} onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
            </Field>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4" style={{ borderColor: "#E2E8F0" }}>
            <span className="text-xs" style={{ color: "#94A3B8" }}>A verification link will be sent before the change takes effect.</span>
            <button onClick={() => void handleSaveEmail()} disabled={emailLoading} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors" style={{ background: emailLoading ? "#94A3B8" : "#1D4ED8", cursor: emailLoading ? "not-allowed" : "pointer" }}>
              <Save size={14} /> {emailLoading ? "Saving..." : "Save Email"}
            </button>
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
          <div className="mb-5">
            <h4 className="font-semibold" style={{ color: "#0B1F4D" }}>Change Password</h4>
            <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Strengthen account security with a new password.</p>
          </div>
          <FeedbackBanner error={passwordError} success={passwordSuccess} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Current Password">
              <PasswordInput value={passwordForm.currentPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))} placeholder="Enter your current password" />
            </Field>
            <div className="grid gap-5 sm:col-span-2 sm:grid-cols-2">
              <div>
                <Field label="New Password">
                  <PasswordInput value={passwordForm.newPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))} placeholder="Min. 8 characters" />
                </Field>
                <div className="mt-3">
                  <StrengthBar password={passwordForm.newPassword} />
                </div>
              </div>
              <Field label="Confirm New Password">
                <PasswordInput value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))} placeholder="Re-enter new password" />
              </Field>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4" style={{ borderColor: "#E2E8F0" }}>
            <span className="text-xs" style={{ color: "#94A3B8" }}>Use a strong password with letters, numbers, and symbols.</span>
            <button onClick={() => void handleSavePassword()} disabled={passwordLoading} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors" style={{ background: passwordLoading ? "#94A3B8" : "#1D4ED8", cursor: passwordLoading ? "not-allowed" : "pointer" }}>
              <Save size={14} /> {passwordLoading ? "Saving..." : "Save Password"}
            </button>
          </div>
        </div>

        {superAdmin ? (
          <div className="rounded-xl p-5" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <div className="mb-5">
              <h4 className="font-semibold" style={{ color: "#0B1F4D" }}>Add New Administrator</h4>
              <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Create a Standard Administrator account with global operational visibility.</p>
            </div>
            <FeedbackBanner error={adminError} success={adminSuccess} />
            <div className="mb-5 flex items-start gap-3 rounded-lg px-4 py-3" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
              <ShieldCheck size={15} style={{ color: "#1D4ED8", flexShrink: 0, marginTop: "1px" }} />
              <p className="text-xs leading-relaxed" style={{ color: "#1D4ED8" }}>
                Every account created here is automatically assigned the Standard Administrator role. Access is limited by system permissions and currently includes global platform visibility.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Administrator Full Name">
                <input type="text" value={adminForm.fullName} onChange={(event) => setAdminForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="Enter the administrator's full name" style={inputSt} onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
              </Field>
              <Field label="Official Administrator Email">
                <input type="email" value={adminForm.adminEmail} onChange={(event) => setAdminForm((current) => ({ ...current, adminEmail: event.target.value }))} placeholder="Enter the administrator email" style={inputSt} onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
              </Field>
              <div>
                <Field label="Initial Password">
                  <PasswordInput value={adminForm.newPassword} onChange={(value) => setAdminForm((current) => ({ ...current, newPassword: value }))} placeholder="Min. 8 characters" />
                </Field>
                <div className="mt-3">
                  <StrengthBar password={adminForm.newPassword} />
                </div>
              </div>
              <Field label="Confirm Password">
                <PasswordInput value={adminForm.confirmPassword} onChange={(value) => setAdminForm((current) => ({ ...current, confirmPassword: value }))} placeholder="Re-enter password" />
              </Field>
              <div className="sm:col-span-2">
                <p className="mb-5 text-sm" style={{ color: "#64748B" }}>
                  Administrator accounts are created with restricted operational access.
                </p>
                <Field label="Your Current Password">
                  <PasswordInput value={adminForm.currentPassword} onChange={(value) => setAdminForm((current) => ({ ...current, currentPassword: value }))} placeholder="Authorize this action" />
                </Field>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4" style={{ borderColor: "#E2E8F0" }}>
              <span className="text-xs" style={{ color: "#94A3B8" }}>Administrator creation requires your current password for security confirmation.</span>
              <button onClick={() => void handleCreateAdmin()} disabled={adminLoading} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors" style={{ background: adminLoading ? "#94A3B8" : "#1D4ED8", cursor: adminLoading ? "not-allowed" : "pointer" }}>
                <UserPlus size={14} /> {adminLoading ? "Creating..." : "Create Administrator Account"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SystemTab() {
  const [error, setError] = useState("");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>System Configurations</h3>
        <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Control platform-wide behavior, security, and defaults.</p>
      </div>

      <FeedbackBanner error={error} success="" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label style={labelSt}>Session Timeout (minutes)</label>
          <input type="number" value="30" disabled style={disabledSt} />
          <p className="mt-1.5 text-xs" style={{ color: "#94A3B8" }}>Session timeout settings are enforced by the backend and are not editable from Swagger yet.</p>
        </div>
        <div>
          <label style={labelSt}>Max CV Upload Size (MB)</label>
          <input type="number" value="5" disabled style={disabledSt} />
          <p className="mt-1.5 text-xs" style={{ color: "#94A3B8" }}>Maximum CV size is managed by the backend and currently limited to 5 MB.</p>
        </div>
      </div>
      <div className="flex justify-end border-t pt-4" style={{ borderColor: "#E2E8F0" }}>
        <button
          onClick={() => setError("No backend endpoint exists for editable system configuration yet.")}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ background: "#1D4ED8" }}
        >
          <Save size={14} /> Save System Config
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
        <div className="flex overflow-hidden rounded-xl bg-white" style={{ border: "1px solid #E2E8F0" }}>
          {TABS.map((tabOption, index) => {
            const active = tab === tabOption.key;
            return (
              <button
                key={tabOption.key}
                onClick={() => setTab(tabOption.key)}
                className="flex flex-1 items-center justify-center gap-2.5 px-5 py-3.5 text-sm font-medium transition-all duration-150"
                style={{
                  background: active ? "#EFF6FF" : "transparent",
                  color: active ? "#1D4ED8" : "#64748B",
                  borderRight: index < TABS.length - 1 ? "1px solid #E2E8F0" : "none",
                  borderBottom: active ? "2px solid #1D4ED8" : "2px solid transparent",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span>{tabOption.icon}</span>
                <span className="hidden sm:block">{tabOption.label}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-white p-7 lg:p-9" style={{ border: "1px solid #E2E8F0" }}>
          {tab === "profile" ? <ProfileTab /> : null}
          {tab === "system" ? <SystemTab /> : null}
        </div>
      </div>
    </AdminLayout>
  );
}
