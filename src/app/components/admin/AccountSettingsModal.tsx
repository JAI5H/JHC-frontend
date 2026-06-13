import { useState } from "react";
import { X, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

type Tab = "email" | "password" | "addAdmin";

interface Props { onClose: () => void; }

/* ─── Shared styles ─── */
const inputSt: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "8px",
  border: "1px solid #E2E8F0", background: "#F8F9FA",
  fontSize: "0.875rem", color: "#0F172A", outline: "none",
  fontFamily: "'Inter', system-ui, sans-serif", transition: "border-color 0.15s",
};
const labelSt: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748B",
  marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em",
};

/* ─── Password field with show/hide toggle ─── */
function PwdInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputSt, paddingRight: "40px" }}
        onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
      />
      <button type="button" onClick={() => setShow((v) => !v)}
        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", outline: "none", border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "flex" }}>
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={labelSt}>{label}</label>
      {children}
    </div>
  );
}

/* ─── Strength bar ─── */
function StrengthBar({ pwd }: { pwd: string }) {
  if (!pwd) return null;
  const s = Math.min(4,
    (pwd.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(pwd) ? 1 : 0) +
    (/[0-9]/.test(pwd) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pwd) ? 1 : 0)
  );
  const colors = ["#E2E8F0","#DC2626","#D97706","#16A34A","#1D4ED8"];
  const labels = ["","Too short","Weak","Good","Strong"];
  return (
    <div className="flex items-center gap-2">
      {[1,2,3,4].map((l) => (
        <div key={l} className="flex-1 h-1 rounded-full" style={{ background: l <= s ? colors[s] : "#E2E8F0" }} />
      ))}
      <span className="text-xs whitespace-nowrap" style={{ color: "#64748B" }}>{labels[s]}</span>
    </div>
  );
}

/* ─── Initial form states ─── */
const initEmail    = { currentPassword: "", newEmail: "" };
const initPassword = { currentPassword: "", newPassword: "", confirmPassword: "" };
const initAdmin    = { currentPassword: "", adminEmail: "", newPassword: "", confirmPassword: "" };

/* ═══════════════════ MODAL ═══════════════════ */
export function AccountSettingsModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>("email");
  const [success, setSuccess] = useState<Tab | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* Per-tab state */
  const [eF, setEF] = useState(initEmail);
  const [pF, setPF] = useState(initPassword);
  const [aF, setAF] = useState(initAdmin);

  const TABS: { key: Tab; label: string }[] = [
    { key: "email",    label: "Change Email"    },
    { key: "password", label: "Change Password" },
    { key: "addAdmin", label: "Add Super Admin" },
  ];

  const resetAll = () => {
    setEF(initEmail); setPF(initPassword); setAF(initAdmin);
    setError(""); setSaving(false); setSuccess(null);
  };

  const handleClose = () => { resetAll(); onClose(); };

  const switchTab = (t: Tab) => { setTab(t); setError(""); };

  const validate = (): string => {
    if (tab === "email") {
      if (!eF.currentPassword) return "Current password is required.";
      if (!eF.newEmail || !eF.newEmail.includes("@")) return "Enter a valid email address.";
    }
    if (tab === "password") {
      if (!pF.currentPassword) return "Current password is required.";
      if (pF.newPassword.length < 8) return "New password must be at least 8 characters.";
      if (pF.newPassword !== pF.confirmPassword) return "Passwords do not match.";
    }
    if (tab === "addAdmin") {
      if (!aF.currentPassword) return "Your current password is required to authorize this action.";
      if (!aF.adminEmail || !aF.adminEmail.includes("@")) return "Enter a valid email for the new admin.";
      if (aF.newPassword.length < 8) return "New admin password must be at least 8 characters.";
      if (aF.newPassword !== aF.confirmPassword) return "Passwords do not match.";
    }
    return "";
  };

  const handleSave = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setTimeout(() => { setSaving(false); setSuccess(tab); }, 1300);
  };

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: "9px 20px", fontSize: "0.875rem", fontWeight: 700,
    color: "#ffffff", background: disabled ? "#94A3B8" : "#1D4ED8",
    border: "none", borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    outline: "none", transition: "background 0.15s",
  });

  const successLabels: Record<Tab, string> = {
    email:    "Email address updated successfully.",
    password: "Password changed successfully.",
    addAdmin: "New Super Admin account created successfully.",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(11,31,77,0.35)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="w-full flex flex-col" style={{ maxWidth: "500px", background: "#ffffff", border: "1px solid #E2E8F0", borderRadius: "16px", overflow: "hidden" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E2E8F0" }}>
          <div>
            <div className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>Account Settings</div>
            <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>Super Administrator · JHC Admin</div>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "#94A3B8", outline: "none", border: "1px solid #E2E8F0", background: "transparent", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F8F9FA"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}>
            <X size={15} />
          </button>
        </div>

        {/* Success screen */}
        {success ? (
          <div className="flex flex-col items-center justify-center gap-4 py-14 px-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#EFF6FF" }}>
              <CheckCircle2 size={28} style={{ color: "#1D4ED8" }} />
            </div>
            <div className="text-center">
              <div className="font-bold" style={{ color: "#0B1F4D" }}>Changes Saved</div>
              <p className="text-sm mt-1" style={{ color: "#64748B" }}>{successLabels[success]}</p>
            </div>
            <button onClick={handleClose} style={btnStyle(false)}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}>
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Tab bar — 3 tabs */}
            <div className="flex border-b" style={{ borderColor: "#E2E8F0" }}>
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <button key={t.key} onClick={() => switchTab(t.key)}
                    style={{
                      flex: 1, padding: "11px 8px", fontSize: "0.8125rem",
                      fontWeight: active ? 700 : 500,
                      color: active ? "#1D4ED8" : "#94A3B8",
                      background: "transparent", border: "none",
                      borderBottom: active ? "2px solid #1D4ED8" : "2px solid transparent",
                      cursor: "pointer", outline: "none", transition: "all 0.15s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "#64748B"; }}
                    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Form body */}
            <div className="px-6 py-6 flex flex-col gap-5">

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm"
                  style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}

              {/* ── Tab 1: Change Email ── */}
              {tab === "email" && (
                <>
                  <Field label="Current Password">
                    <PwdInput value={eF.currentPassword} onChange={(v) => setEF((p) => ({ ...p, currentPassword: v }))} placeholder="Enter current password to verify" />
                  </Field>
                  <Field label="New Email Address">
                    <input type="email" value={eF.newEmail} onChange={(e) => setEF((p) => ({ ...p, newEmail: e.target.value }))}
                      placeholder="Enter the new admin email" style={inputSt}
                      onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
                  </Field>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>A verification link will be sent before the change takes effect.</p>
                </>
              )}

              {/* ── Tab 2: Change Password ── */}
              {tab === "password" && (
                <>
                  <Field label="Current Password">
                    <PwdInput value={pF.currentPassword} onChange={(v) => setPF((p) => ({ ...p, currentPassword: v }))} placeholder="Enter your current password" />
                  </Field>
                  <Field label="New Password">
                    <PwdInput value={pF.newPassword} onChange={(v) => setPF((p) => ({ ...p, newPassword: v }))} placeholder="Min. 8 characters" />
                  </Field>
                  <StrengthBar pwd={pF.newPassword} />
                  <Field label="Confirm New Password">
                    <PwdInput value={pF.confirmPassword} onChange={(v) => setPF((p) => ({ ...p, confirmPassword: v }))} placeholder="Re-enter new password" />
                  </Field>
                </>
              )}

              {/* ── Tab 3: Add Super Admin ── */}
              {tab === "addAdmin" && (
                <>
                  {/* Privilege notice */}
                  <div className="flex items-start gap-3 px-4 py-3 rounded-lg"
                    style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                    <ShieldCheck size={15} style={{ color: "#1D4ED8", flexShrink: 0, marginTop: "1px" }} />
                    <p className="text-xs leading-relaxed" style={{ color: "#1D4ED8" }}>
                      The new account will have full Super Admin privileges — identical to yours. This action requires your current password as authorization.
                    </p>
                  </div>
                  <Field label="Your Current Password">
                    <PwdInput value={aF.currentPassword} onChange={(v) => setAF((p) => ({ ...p, currentPassword: v }))} placeholder="Authorize this action" />
                  </Field>
                  <Field label="New Super Admin Email">
                    <input type="email" value={aF.adminEmail} onChange={(e) => setAF((p) => ({ ...p, adminEmail: e.target.value }))}
                      placeholder="Enter email for the new super admin" style={inputSt}
                      onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
                  </Field>
                  <Field label="New Password">
                    <PwdInput value={aF.newPassword} onChange={(v) => setAF((p) => ({ ...p, newPassword: v }))} placeholder="Min. 8 characters" />
                  </Field>
                  <StrengthBar pwd={aF.newPassword} />
                  <Field label="Confirm Password">
                    <PwdInput value={aF.confirmPassword} onChange={(v) => setAF((p) => ({ ...p, confirmPassword: v }))} placeholder="Re-enter password" />
                  </Field>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "#E2E8F0", background: "#F8F9FA" }}>
              <button onClick={handleClose}
                style={{ padding: "9px 18px", fontSize: "0.875rem", fontWeight: 500, color: "#64748B", background: "transparent", border: "none", cursor: "pointer", outline: "none", borderRadius: "8px", transition: "color 0.15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#0B1F4D")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={btnStyle(saving)}
                onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; }}
                onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
