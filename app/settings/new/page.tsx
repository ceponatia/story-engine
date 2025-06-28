import { UnifiedSettingManager } from "@/components/settings/unified-setting-manager";
import { LibraryBreadcrumbs } from "@/components/navigation/library-breadcrumbs";
import { getCurrentUserAction } from "@/lib/actions/user-actions";

export default async function Page() {
  const user = await getCurrentUserAction();

  return (
    <div className="container mx-auto px-4 py-6">
      <LibraryBreadcrumbs type="settings" />
      <UnifiedSettingManager
        mode="create"
        currentUser={user}
      />
    </div>
  );
}