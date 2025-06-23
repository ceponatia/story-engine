import { createClient } from "@/lib/supabase/server";
import { SettingForm } from "./setting-form";
import { LibraryBreadcrumbs } from "@/components/navigation/library-breadcrumbs";

export async function SettingPage({ id }: { id: string }) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data } = await supabase
    .from("settings")
    .select(`
      *,
      setting_locations (
        location_id,
        locations (
          id,
          name,
          description
        )
      )
    `)
    .eq("id", id)
    .single();

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LibraryBreadcrumbs type="settings" />
        <p className="p-4 text-center">Setting not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <LibraryBreadcrumbs 
        type="settings" 
        itemName={data.name} 
        itemId={id} 
      />
      <SettingForm setting={data} currentUser={user} />
    </div>
  );
}