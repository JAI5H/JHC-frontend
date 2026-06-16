import { AdminLayout } from "../components/admin/AdminLayout";
import { AdministratorManagementPanel } from "../components/admin/AdministratorManagementPanel";

export default function AdminAdministratorsPage() {
  return (
    <AdminLayout title="Administrator Management">
      <AdministratorManagementPanel />
    </AdminLayout>
  );
}
