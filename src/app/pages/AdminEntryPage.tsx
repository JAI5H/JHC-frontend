import { Navigate } from "react-router";
import { getAdminSession } from "../components/admin/adminSession";

export default function AdminEntryPage() {
  return <Navigate replace to={getAdminSession() ? "/admin/overview" : "/admin/login"} />;
}
