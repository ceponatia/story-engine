import { createClient } from "@/lib/supabase/server";
import { CharacterForm } from "./character-form";

export async function CharacterPage({ id }: { id: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("characters")
    .select()
    .eq("id", id)
    .single();

  if (!data) {
    return <p className="p-4 text-center">Character not found.</p>;
  }

  return <CharacterForm character={data} />;
}
