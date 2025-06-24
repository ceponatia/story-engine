import { NewAdventureForm } from "@/components/adventures/new-adventure-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewAdventurePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user's characters for selection
  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  // Fetch user's locations for optional selection
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Start New Adventure</h1>
      <NewAdventureForm 
        characters={characters || []} 
        locations={locations || []}
        userId={user.id}
      />
    </div>
  );
}