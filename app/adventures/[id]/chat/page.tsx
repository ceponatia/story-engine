import { AdventureChat } from "@/components/adventures/adventure-chat";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdventureChatPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch adventure details
  const { data: adventure, error: adventureError } = await supabase
    .from("adventures")
    .select(`
      *,
      adventure_characters (*)
    `)
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .single();

  if (adventureError || !adventure) {
    redirect("/");
  }

  // Fetch existing messages
  const { data: messages } = await supabase
    .from("adventure_messages")
    .select("*")
    .eq("adventure_id", resolvedParams.id)
    .order("created_at", { ascending: true })
    .limit(10);

  return (
    <div className="container mx-auto h-[calc(100vh-4rem)]">
      <AdventureChat 
        adventure={adventure}
        initialMessages={messages || []}
        userId={user.id}
      />
    </div>
  );
}