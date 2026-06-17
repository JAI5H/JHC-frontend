import { useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Globe2,
  KeyRound,
  MoreHorizontal,
  PencilLine,
  Search,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";
import { getAdminSession, hasAdminAccessToken } from "./adminSession";
import {
  deleteAdministrator,
  editAdministrator,
  getAdministrators,
  resetAdministratorPassword,
  setAdministratorStatus,
  type AdminDirectoryRecord,
} from "../../../services/api/settingsApi";
import { getAxiosErrorMessage } from "../../../services/api/utils";

type DirectoryFilter = "All" | "Name" | "Email";

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

function StatusPill({ isActive }: { isActive: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{
        background: isActive ? "#F0FDF4" : "#FFF7ED",
        color: isActive ? "#16A34A" : "#D97706",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: isActive ? "#16A34A" : "#D97706" }} />
      {isActive ? "Active" : "Suspended"}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-CA");
}

function ActionModal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-[520px] rounded-2xl bg-white p-6"
        style={{ border: "1px solid #E2E8F0", boxShadow: "0 24px 48px rgba(15,23,42,0.18)" }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h4 className="text-base font-bold" style={{ color: "#0B1F4D" }}>{title}</h4>
            <p className="mt-1 text-sm" style={{ color: "#64748B" }}>{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{ borderColor: "#E2E8F0", color: "#64748B", background: "#ffffff" }}
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AdministratorManagementPanel() {
  const session = getAdminSession();
  const [admins, setAdmins] = useState<AdminDirectoryRecord[]>([]);
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryFilter, setDirectoryFilter] = useState<DirectoryFilter>("All");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<AdminDirectoryRecord | null>(null);
  const [editForm, setEditForm] = useState({ fullName: "", email: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminDirectoryRecord | null>(null);
  const [resetForm, setResetForm] = useState({ newPassword: "", confirmPassword: "" });
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    let active = true;

    if (!hasAdminAccessToken()) {
      setIsLoading(false);
      setAdmins([]);
      setError("");
      return () => {
        active = false;
      };
    }

    const loadAdmins = async () => {
      setIsLoading(true);
      setError("");

      try {
        const nextAdmins = await getAdministrators();
        if (!active) return;
        setAdmins(nextAdmins);
      } catch {
        if (!active) return;
        setAdmins([]);
        setError("Unable to load administrators right now.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadAdmins();

    return () => {
      active = false;
    };
  }, []);

  const setMessage = (message: string) => {
    setError("");
    setFeedback(message);
  };

  const handleOpenEdit = (admin: AdminDirectoryRecord) => {
    setOpenActionMenuId(null);
    setEditTarget(admin);
    setEditForm({ fullName: admin.fullName, email: admin.email });
    setFeedback("");
    setError("");
  };

  const handleOpenReset = (admin: AdminDirectoryRecord) => {
    setOpenActionMenuId(null);
    setResetTarget(admin);
    setResetForm({ newPassword: "", confirmPassword: "" });
    setFeedback("");
    setError("");
  };

  const handleSaveEdit = async () => {
    if (!editTarget || editLoading) return;

    setFeedback("");
    setError("");

    if (!editForm.fullName.trim()) {
      setError("Administrator full name is required.");
      return;
    }

    if (!editForm.email.trim() || !editForm.email.includes("@")) {
      setError("Enter a valid administrator email.");
      return;
    }

    setEditLoading(true);

    try {
      await editAdministrator(editTarget.id, {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
      });

      setAdmins((current) =>
        current.map((item) =>
          item.id === editTarget.id
            ? { ...item, fullName: editForm.fullName.trim(), email: editForm.email.trim() }
            : item,
        ),
      );
      setEditTarget(null);
      setMessage("Administrator details updated successfully.");
    } catch (requestError) {
      setFeedback("");
      setError(getAxiosErrorMessage(requestError, "Unable to update this administrator right now."));
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleStatus = async (admin: AdminDirectoryRecord) => {
    if (statusUpdatingId) return;

    setFeedback("");
    setError("");
    setStatusUpdatingId(admin.id);

    try {
      await setAdministratorStatus(admin.id);
      const nextActive = !admin.isActive;
      setAdmins((current) =>
        current.map((item) =>
          item.id === admin.id
            ? { ...item, isActive: nextActive }
            : item,
        ),
      );
      setOpenActionMenuId(null);
      setMessage(`${admin.fullName} has been ${nextActive ? "reactivated" : "suspended"}.`);
    } catch (requestError) {
      setFeedback("");
      setError(getAxiosErrorMessage(requestError, "Unable to update this administrator status right now."));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || resetLoading) return;

    setFeedback("");
    setError("");

    if (resetForm.newPassword.length < 8) {
      setError("Temporary password must be at least 8 characters.");
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setResetLoading(true);

    try {
      await resetAdministratorPassword(resetTarget.id, {
        newPassword: resetForm.newPassword,
      });
      setResetTarget(null);
      setMessage("Temporary password reset completed successfully.");
    } catch (requestError) {
      setFeedback("");
      setError(getAxiosErrorMessage(requestError, "Unable to reset this administrator password right now."));
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteAdmin = async (admin: AdminDirectoryRecord) => {
    if (deletingId) return;

    if (session?.email && session.email.toLowerCase() === admin.email.toLowerCase()) {
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

    setDeletingId(admin.id);

    try {
      await deleteAdministrator(admin.id);
      setAdmins((current) => current.filter((item) => item.id !== admin.id));
      setOpenActionMenuId(null);
      setMessage(`${admin.fullName} has been removed from Administrator Management.`);
    } catch {
      setFeedback("");
      setError("Unable to delete this administrator right now.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalAdmins = admins.length;
  const activeAdmins = admins.filter((admin) => admin.isActive).length;
  const suspendedAdmins = admins.filter((admin) => !admin.isActive).length;
  const regionsCovered = new Set(admins.map((admin) => admin.region)).size;
  const normalizedSearch = directorySearch.trim().toLowerCase();
  const filteredAdmins = admins.filter((admin) => {
    if (!normalizedSearch) return true;

    if (directoryFilter === "Name") {
      return admin.fullName.toLowerCase().includes(normalizedSearch);
    }

    if (directoryFilter === "Email") {
      return admin.email.toLowerCase().includes(normalizedSearch);
    }

    return (
      admin.fullName.toLowerCase().includes(normalizedSearch) ||
      admin.email.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>Administrator Management</h3>
        <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Manage administrator visibility, status, and secure account recovery from one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Administrators", value: totalAdmins, icon: <Users size={18} />, color: "#1D4ED8", note: "From live admin directory" },
          { label: "Active Administrators", value: activeAdmins, icon: <UserCheck size={18} />, color: "#16A34A", note: "Accounts currently enabled" },
          { label: "Suspended Administrators", value: suspendedAdmins, icon: <UserX size={18} />, color: "#D97706", note: "Accounts currently disabled" },
          { label: "Regions Covered", value: regionsCovered, icon: <Globe2 size={18} />, color: "#0B1F4D", note: "Operational visibility currently assigned" },
        ].map((metric) => (
          <div key={metric.label} className="flex flex-col gap-3 rounded-xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>{metric.label}</span>
              <span style={{ color: metric.color }}>{metric.icon}</span>
            </div>
            <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "#0B1F4D", lineHeight: 1, letterSpacing: "-0.025em" }}>
              {isLoading ? "..." : metric.value}
            </div>
            <div className="text-xs font-medium" style={{ color: "#64748B" }}>{metric.note}</div>
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
          <div className="mt-1 text-sm" style={{ color: "#64748B" }}>Live administrators with regional visibility and active account status.</div>
        </div>

        {(feedback || error) ? (
          <div
            className="mx-6 mt-4 flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm"
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: "#94A3B8" }}>
                    Loading administrators...
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: "#94A3B8" }}>
                    No administrators match the current search.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin, index) => (
                  <tr
                    key={admin.id}
                    style={{ borderBottom: index < filteredAdmins.length - 1 ? "1px solid #F1F5F9" : "none" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFBFC")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                          {admin.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: "#0B1F4D" }}>{admin.fullName}</div>
                          <div className="text-xs" style={{ color: "#94A3B8" }}>{admin.isSuperAdmin ? "Super Admin" : "Standard Administrator"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#0F172A" }}>{admin.email}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#64748B" }}>{admin.region}</td>
                    <td className="px-6 py-4"><StatusPill isActive={admin.isActive} /></td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#64748B" }}>{formatDate(admin.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenActionMenuId((current) => (current === admin.id ? null : admin.id))}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
                          style={{ borderColor: "#E2E8F0", color: "#64748B", background: "#ffffff" }}
                        >
                          <MoreHorizontal size={15} />
                        </button>

                        {openActionMenuId === admin.id ? (
                          <div
                            className="absolute right-0 top-full z-20 mt-2 w-[190px] rounded-xl border bg-white p-2"
                            style={{ borderColor: "#E2E8F0", boxShadow: "0 12px 32px rgba(15,23,42,0.12)" }}
                          >
                            {[
                              { label: "Edit Administrator", icon: <PencilLine size={14} />, action: () => handleOpenEdit(admin) },
                              { label: "Reset Password", icon: <KeyRound size={14} />, action: () => handleOpenReset(admin) },
                              { label: statusUpdatingId === admin.id ? "Updating..." : admin.isActive ? "Suspend" : "Reactivate", icon: <UserX size={14} />, action: () => void handleToggleStatus(admin) },
                              { label: deletingId === admin.id ? "Deleting..." : "Delete Administrator", icon: <Trash2 size={14} />, action: () => void handleDeleteAdmin(admin) },
                            ].map((item) => (
                              <button
                                key={item.label}
                                onClick={item.action}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                                style={{ color: item.label.includes("Delete") ? "#DC2626" : "#0B1F4D" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#F8FAFC")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                              >
                                {item.icon}
                                {item.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editTarget ? (
        <ActionModal
          title="Edit Administrator"
          description="Update the administrator identity details stored in the live directory."
          onClose={() => setEditTarget(null)}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Full Name</label>
              <input
                value={editForm.fullName}
                onChange={(event) => setEditForm((current) => ({ ...current, fullName: event.target.value }))}
                style={inputSt}
              />
            </div>
            <div className="sm:col-span-2">
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Official Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                style={inputSt}
              />
            </div>
            <div className="sm:col-span-2">
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Assigned Region</label>
              <input value={editTarget.region} disabled style={{ ...inputSt, background: "#F1F5F9", color: "#94A3B8", cursor: "not-allowed" }} />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setEditTarget(null)} className="rounded-xl border px-4 py-2 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Cancel</button>
            <button type="button" onClick={() => void handleSaveEdit()} disabled={editLoading} className="rounded-xl px-5 py-2 text-sm font-semibold text-white" style={{ background: editLoading ? "#94A3B8" : "#1D4ED8", cursor: editLoading ? "not-allowed" : "pointer" }}>{editLoading ? "Saving..." : "Save Changes"}</button>
          </div>
        </ActionModal>
      ) : null}

      {resetTarget ? (
        <ActionModal
          title="Reset Password"
          description="The administrator will be required to create a new password on the next login."
          onClose={() => setResetTarget(null)}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>New Temporary Password</label>
              <input
                type="password"
                value={resetForm.newPassword}
                onChange={(event) => setResetForm((current) => ({ ...current, newPassword: event.target.value }))}
                style={inputSt}
              />
            </div>
            <div className="sm:col-span-2">
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Confirm Password</label>
              <input
                type="password"
                value={resetForm.confirmPassword}
                onChange={(event) => setResetForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                style={inputSt}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setResetTarget(null)} className="rounded-xl border px-4 py-2 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Cancel</button>
            <button type="button" onClick={() => void handleResetPassword()} disabled={resetLoading} className="rounded-xl px-5 py-2 text-sm font-semibold text-white" style={{ background: resetLoading ? "#94A3B8" : "#1D4ED8", cursor: resetLoading ? "not-allowed" : "pointer" }}>{resetLoading ? "Saving..." : "Reset Password"}</button>
          </div>
        </ActionModal>
      ) : null}
    </div>
  );
}
