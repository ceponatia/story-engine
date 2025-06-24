import { AdventuresList } from "@/components/adventures/adventures-list";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ContinueAdventurePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user's active adventures
  const { data: adventures } = await supabase
    .from("adventures")
    .select(`
      *,
      characters!adventures_character_id_fkey (name),
      locations!adventures_location_id_fkey (name)
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Continue Your Adventures</h1>
      <AdventuresList adventures={adventures || []} />
    </div>
  );
}