import { DatabaseAdmin } from "@/components/admin/database-admin";
import { JobManagement } from "@/components/admin/job-management";
export default function AdminPage() {
    return (<div className="min-h-screen space-y-8 p-6">
      <JobManagement />
      <hr className="my-8"/>
      <DatabaseAdmin />
    </div>);
}
