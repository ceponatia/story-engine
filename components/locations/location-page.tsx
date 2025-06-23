import { createClient } from "@/lib/supabase/server";
import { LocationForm } from "./location-form";
import { LibraryBreadcrumbs } from "@/components/navigation/library-breadcrumbs";

export async function LocationPage({ id }: { id: string }) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data } = await supabase
    .from("locations")
    .select()
    .eq("id", id)
    .single();

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LibraryBreadcrumbs type="locations" />
        <p className="p-4 text-center">Location not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <LibraryBreadcrumbs 
        type="locations" 
        itemName={data.name} 
        itemId={id} 
      />
      <LocationForm location={data} currentUser={user} />
    </div>
  );
}