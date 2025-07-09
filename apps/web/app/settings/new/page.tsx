import { UnifiedSettingManager } from "@/components/settings/unified-setting-manager";
import { LibraryBreadcrumbs } from "@/components/navigation/library-breadcrumbs";
import { requireAuth } from "@story-engine/auth";

export default async function Page() {
  const { user } = await requireAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      <LibraryBreadcrumbs type="settings" />
      <UnifiedSettingManager mode="create" currentUser={user} />
    </div>
  );
}
