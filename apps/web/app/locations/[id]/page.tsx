import { UnifiedLocationManager } from "@/components/locations/unified-location-manager";
import { LibraryBreadcrumbs } from "@/components/navigation/library-breadcrumbs";
import { getLocationAction } from "@/lib/actions/location-actions";
import { requireAuth } from "@/lib/auth-helper";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let location = null;
  let currentUser = null;

  try {
    [location, currentUser] = await Promise.all([
      getLocationAction(id),
      requireAuth().then((auth) => auth.user),
    ]);
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  if (!location) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LibraryBreadcrumbs type="locations" />
        <p className="p-4 text-center">
          Location not found or you don&apos;t have permission to view it.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <LibraryBreadcrumbs type="locations" itemName={location.name} itemId={id} />
      <div className="max-w-4xl mx-auto">
        <UnifiedLocationManager mode="view" location={location} currentUser={currentUser} />
      </div>
    </div>
  );
}
