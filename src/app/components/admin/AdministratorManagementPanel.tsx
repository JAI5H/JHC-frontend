import { useState } from "react";
import {
  ChevronDown,
  Eye,
  EyeOff,
  AlertCircle,
  Search,
  Users,
  UserCheck,
  UserX,
  Globe2,
  MoreHorizontal,
  PencilLine,
  KeyRound,
  Trash2,
  X,
  Save,
} from "lucide-react";

type AdminStatus = "Active" | "Suspended";
type DirectoryFilter = "All" | "Name" | "Email";
type AdminRecord = {
  id: number;
  name: string;
  email: string;
  region: string;
  status: AdminStatus;
  createdDate: string;
  isSuperAdmin: boolean;
};

const ADMIN_MODAL_REGIONS = ["All Regions", "GCC & Egypt Hubs", "Saudi Arabia Hub", "Egypt Hub"];
const ADMIN_MOCK_DATA: AdminRecord[] = [
  { id: 1, name: "JHC Admin", email: "admin@jhc-group.com", region: "All Regions", status: "Active", createdDate: "2026-01-12", isSuperAdmin: true },
  { id: 2, name: "Mona Adel", email: "mona.adel@jhc-group.com", region: "GCC & Egypt Hubs", status: "Active", createdDate: "2026-02-03", isSuperAdmin: false },
  { id: 3, name: "Saif Al-Harbi", email: "saif.harbi@jhc-group.com", region: "Saudi Arabia Hub", status: "Suspended", createdDate: "2026-03-18", isSuperAdmin: false },
  { id: 4, name: "Nour Hassan", email: "nour.hassan@jhc-group.com", region: "Egypt Hub", status: "Active", createdDate: "2026-04-27", isSuperAdmin: false },
];

const inputSt: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid #E2E8F0", background: "#F8FAFC",
  fontSize: "0.875rem", color: "#0F172A", outline: "none",
  fontFamily: "'Sora', system-ui, sans-serif", transition: "border-color 0.15s",
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

function StatusPill({ status }: { status: AdminStatus }) {
  const active = status === "Active";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{
        background: active ? "#F0FDF4" : "#FFF7ED",
        color: active ? "#16A34A" : "#D97706",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? "#16A34A" : "#D97706" }} />
      {status}
    </span>
  );
}

export function AdministratorManagementPanel() {
  const currentAdminId = 1;
  const [admins, setAdmins] = useState<AdminRecord[]>(ADMIN_MOCK_DATA);
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);
  const [resettingAdmin, setResettingAdmin] = useState<AdminRecord | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", region: "All Regions", status: "Active" as AdminStatus });
  const [resetForm, setResetForm] = useState({ password: "", confirmPassword: "" });
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryFilter, setDirectoryFilter] = useState<DirectoryFilter>("All");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const totalAdmins = admins.length;
  const activeAdmins = admins.filter((admin) => admin.status === "Active").length;
  const suspendedAdmins = admins.filter((admin) => admin.status === "Suspended").length;
  const regionsCovered = new Set(admins.map((admin) => admin.region)).size;
  const normalizedSearch = directorySearch.trim().toLowerCase();
  const filteredAdmins = admins.filter((admin) => {
    if (!normalizedSearch) return true;

    if (directoryFilter === "Name") {
      return admin.name.toLowerCase().includes(normalizedSearch);
    }

    if (directoryFilter === "Email") {
      return admin.email.toLowerCase().includes(normalizedSearch);
    }

    return (
      admin.name.toLowerCase().includes(normalizedSearch) ||
      admin.email.toLowerCase().includes(normalizedSearch)
    );
  });

  const setMessage = (message: string) => {
    setError("");
    setFeedback(message);
  };

  const toggleAdminStatus = (adminId: number) => {
    setAdmins((current) =>
      current.map((admin) =>
        admin.id === adminId
          ? { ...admin, status: admin.status === "Active" ? "Suspended" : "Active" }
          : admin,
      ),
    );
    setOpenActionMenuId(null);
    const admin = admins.find((item) => item.id === adminId);
    if (admin) {
      setMessage(`${admin.name} has been ${admin.status === "Active" ? "suspended" : "reactivated"}.`);
    }
  };

  const deleteAdmin = (adminId: number) => {
    const admin = admins.find((item) => item.id === adminId);
    if (!admin) return;

    if (admin.id === currentAdminId) {
      setFeedback("");
      setError("The currently logged-in administrator cannot delete their own account.");
      setOpenActionMenuId(null);
      return;
    }

    const superAdminCount = admins.filter((item) => item.isSuperAdmin).length;
    if (admin.isSuperAdmin && superAdminCount === 1) {
      setFeedback("");
      setError("The system cannot delete the last remaining Super Admin.");
      setOpenActionMenuId(null);
      return;
    }

    setAdmins((current) => current.filter((item) => item.id !== adminId));
    setOpenActionMenuId(null);
    setMessage(`${admin.name} has been removed from Administrator Management.`);
  };

  const openEditModal = (admin: AdminRecord) => {
    setOpenActionMenuId(null);
    setFeedback("");
    setError("");
    setEditingAdmin(admin);
    setEditForm({
      name: admin.name,
      email: admin.email,
      region: admin.region,
      status: admin.status,
    });
  };

  const saveEditModal = () => {
    if (!editingAdmin) return;
    if (!editForm.name.trim() || !editForm.email.includes("@")) {
      setError("Please provide a valid administrator name and email address.");
      return;
    }

    setAdmins((current) =>
      current.map((admin) =>
        admin.id === editingAdmin.id
          ? { ...admin, name: editForm.name.trim(), email: editForm.email.trim(), region: editForm.region, status: editForm.status }
          : admin,
      ),
    );
    setEditingAdmin(null);
    setMessage("Administrator details updated successfully.");
  };

  const openResetModal = (admin: AdminRecord) => {
    setOpenActionMenuId(null);
    setFeedback("");
    setError("");
    setResettingAdmin(admin);
    setResetForm({ password: "", confirmPassword: "" });
  };

  const saveResetModal = () => {
    if (!resettingAdmin) return;
    if (resetForm.password.length < 8) {
      setError("Temporary password must be at least 8 characters.");
      return;
    }
    if (resetForm.password !== resetForm.confirmPassword) {
      setError("Temporary password and confirmation do not match.");
      return;
    }

    setResettingAdmin(null);
    setMessage(`A temporary password has been assigned to ${resettingAdmin.name}.`);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>Administrator Management</h3>
          <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Manage administrator visibility, status, and secure account recovery from one place.</p>
        </div>

        {(feedback || error) && (
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
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Administrators", value: totalAdmins, icon: <Users size={18} />, color: "#1D4ED8" },
            { label: "Active Administrators", value: activeAdmins, icon: <UserCheck size={18} />, color: "#16A34A" },
            { label: "Suspended Administrators", value: suspendedAdmins, icon: <UserX size={18} />, color: "#D97706" },
            { label: "Regions Covered", value: regionsCovered, icon: <Globe2 size={18} />, color: "#0B1F4D" },
          ].map((metric) => (
            <div key={metric.label} className="flex flex-col gap-3 rounded-xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>{metric.label}</span>
                <span style={{ color: metric.color }}>{metric.icon}</span>
              </div>
              <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "#0B1F4D", lineHeight: 1, letterSpacing: "-0.025em" }}>
                {metric.value}
              </div>
              <div className="text-xs font-medium" style={{ color: "#64748B" }}>
                {metric.label === "Regions Covered" ? "Operational visibility currently assigned" : "Mock summary for enterprise admin operations"}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-5" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "#1D4ED8" }}>Security Rules</div>
          <div className="flex flex-col gap-2 text-sm" style={{ color: "#1D4ED8" }}>
            <p>Only Super Admin users can access Administrator Management.</p>
            <p>Standard Administrators cannot see this tab.</p>
            <p>The currently logged-in administrator cannot delete their own account.</p>
            <p>The system should prevent deletion of the last remaining Super Admin.</p>
            <p>Password resets force the administrator to change their password on next login.</p>
          </div>
        </div>

        <div className="rounded-xl bg-white" style={{ border: "1px solid #E2E8F0" }}>
          <div className="border-b px-6 py-4" style={{ borderColor: "#E2E8F0" }}>
            <div className="font-semibold" style={{ color: "#0B1F4D" }}>Administrators Directory</div>
            <div className="mt-1 text-sm" style={{ color: "#64748B" }}>Mock administrators with regional visibility, status control, and recovery actions.</div>
          </div>

          <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center" style={{ borderColor: "#E2E8F0" }}>
            <div className="relative flex-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
              <input
                type="text"
                value={directorySearch}
                onChange={(event) => setDirectorySearch(event.target.value)}
                placeholder="Search administrator..."
                style={{ ...inputSt, paddingLeft: "36px" }}
                onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>
            <div className="w-full sm:w-[220px]">
              <div className="relative">
                <select
                  value={directoryFilter}
                  onChange={(event) => setDirectoryFilter(event.target.value as DirectoryFilter)}
                  style={{ ...inputSt, cursor: "pointer", appearance: "none", paddingRight: "36px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                >
                  <option value="All">Search In: All</option>
                  <option value="Name">Search In: Name</option>
                  <option value="Email">Search In: Email</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: "860px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                  {["Administrator Name", "Email Address", "Assigned Region", "Status", "Created Date", "Actions"].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider"
                      style={{ color: "#94A3B8", background: "#F8FAFC", letterSpacing: "0.08em" }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin, index) => (
                  <tr
                    key={admin.id}
                    style={{ borderBottom: index < filteredAdmins.length - 1 ? "1px solid #F1F5F9" : "none" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFBFC")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                          {admin.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: "#0B1F4D" }}>{admin.name}</div>
                          <div className="text-xs" style={{ color: "#94A3B8" }}>{admin.isSuperAdmin ? "Super Admin" : "Standard Administrator"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#0F172A" }}>{admin.email}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#64748B" }}>{admin.region}</td>
                    <td className="px-6 py-4"><StatusPill status={admin.status} /></td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#64748B" }}>{admin.createdDate}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenActionMenuId((current) => (current === admin.id ? null : admin.id))}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
                          style={{ borderColor: "#E2E8F0", color: "#64748B", background: "#ffffff" }}
                        >
                          <MoreHorizontal size={15} />
                        </button>

                        {openActionMenuId === admin.id && (
                          <div
                            className="absolute right-0 top-full z-20 mt-2 w-[190px] rounded-xl border bg-white p-2"
                            style={{ borderColor: "#E2E8F0", boxShadow: "0 12px 32px rgba(15,23,42,0.12)" }}
                          >
                            {[
                              { label: "Edit Administrator", icon: <PencilLine size={14} />, action: () => openEditModal(admin) },
                              { label: "Reset Password", icon: <KeyRound size={14} />, action: () => openResetModal(admin) },
                              { label: admin.status === "Active" ? "Suspend" : "Reactivate", icon: <UserX size={14} />, action: () => toggleAdminStatus(admin.id) },
                              { label: "Delete Administrator", icon: <Trash2 size={14} />, action: () => deleteAdmin(admin.id) },
                            ].map((item) => (
                              <button
                                key={item.label}
                                onClick={item.action}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                                style={{ color: item.label === "Delete Administrator" ? "#DC2626" : "#0B1F4D" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#F8FAFC")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                              >
                                {item.icon}
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: "#94A3B8" }}>
                      No administrators match the current search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(11,31,77,0.35)", backdropFilter: "blur(4px)" }}
          onClick={() => setEditingAdmin(null)}
        >
          <div
            className="w-full max-w-[520px] rounded-2xl bg-white"
            style={{ border: "1px solid #E2E8F0", boxShadow: "0 24px 48px rgba(15,23,42,0.16)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#E2E8F0" }}>
              <div>
                <div className="font-bold" style={{ color: "#0B1F4D" }}>Edit Administrator</div>
                <div className="mt-0.5 text-xs" style={{ color: "#94A3B8" }}>Update the administrator profile, region visibility, and current status.</div>
              </div>
              <button
                onClick={() => setEditingAdmin(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border"
                style={{ borderColor: "#E2E8F0", color: "#94A3B8", background: "#ffffff" }}
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-5 px-6 py-6">
              <Field label="Full Name">
                <input
                  value={editForm.name}
                  onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                  style={inputSt}
                  onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </Field>
              <Field label="Official Email">
                <input
                  value={editForm.email}
                  onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                  style={inputSt}
                  onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </Field>
              <Field label="Assigned Region">
                <div className="relative">
                  <select
                    value={editForm.region}
                    onChange={(event) => setEditForm((current) => ({ ...current, region: event.target.value }))}
                    style={{ ...inputSt, cursor: "pointer", appearance: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  >
                    {ADMIN_MODAL_REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
                </div>
              </Field>
              <Field label="Administrator Status">
                <div className="grid grid-cols-2 gap-3">
                  {(["Active", "Suspended"] as AdminStatus[]).map((status) => {
                    const active = editForm.status === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setEditForm((current) => ({ ...current, status }))}
                        className="rounded-xl px-4 py-3 text-sm font-medium transition-all"
                        style={{
                          border: `1px solid ${active ? "#1D4ED8" : "#E2E8F0"}`,
                          background: active ? "#EFF6FF" : "#F8FAFC",
                          color: active ? "#1D4ED8" : "#64748B",
                        }}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
            <div className="flex items-center justify-end gap-3 border-t px-6 py-4" style={{ borderColor: "#E2E8F0" }}>
              <button
                onClick={() => setEditingAdmin(null)}
                className="rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors"
                style={{ borderColor: "#E2E8F0", color: "#64748B", background: "#ffffff" }}
              >
                Cancel
              </button>
              <button
                onClick={saveEditModal}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                style={{ background: "#1D4ED8" }}
              >
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {resettingAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(11,31,77,0.35)", backdropFilter: "blur(4px)" }}
          onClick={() => setResettingAdmin(null)}
        >
          <div
            className="w-full max-w-[520px] rounded-2xl bg-white"
            style={{ border: "1px solid #E2E8F0", boxShadow: "0 24px 48px rgba(15,23,42,0.16)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#E2E8F0" }}>
              <div>
                <div className="font-bold" style={{ color: "#0B1F4D" }}>Reset Administrator Password</div>
                <div className="mt-0.5 text-xs" style={{ color: "#94A3B8" }}>{resettingAdmin.name} will receive a temporary password for the next sign-in.</div>
              </div>
              <button
                onClick={() => setResettingAdmin(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border"
                style={{ borderColor: "#E2E8F0", color: "#94A3B8", background: "#ffffff" }}
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-5 px-6 py-6">
              <Field label="New Temporary Password">
                <PasswordInput value={resetForm.password} onChange={(value) => setResetForm((current) => ({ ...current, password: value }))} placeholder="Enter a temporary password" />
              </Field>
              <div>
                <StrengthBar password={resetForm.password} />
              </div>
              <Field label="Confirm Password">
                <PasswordInput value={resetForm.confirmPassword} onChange={(value) => setResetForm((current) => ({ ...current, confirmPassword: value }))} placeholder="Re-enter the temporary password" />
              </Field>
              <p className="text-sm" style={{ color: "#64748B" }}>
                The administrator will be required to create a new password on the next login.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t px-6 py-4" style={{ borderColor: "#E2E8F0" }}>
              <button
                onClick={() => setResettingAdmin(null)}
                className="rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors"
                style={{ borderColor: "#E2E8F0", color: "#64748B", background: "#ffffff" }}
              >
                Cancel
              </button>
              <button
                onClick={saveResetModal}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                style={{ background: "#1D4ED8" }}
              >
                <KeyRound size={14} /> Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
