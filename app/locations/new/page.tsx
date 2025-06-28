import { UnifiedLocationManager } from "@/components/locations/unified-location-manager";
import { LibraryBreadcrumbs } from "@/components/navigation/library-breadcrumbs";
import { getCurrentUserAction } from "@/lib/actions/user-actions";

export default async function NewLocationPage() {
  const currentUser = await getCurrentUserAction();

  return (
    <div className="container mx-auto px-4 py-6">
      <LibraryBreadcrumbs type="locations" />
      <div className="max-w-4xl mx-auto">
        <UnifiedLocationManager 
          mode="create" 
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}