import { AdventureChat } from "@/components/adventures/adventure-chat";
import { redirect } from "next/navigation";
import { getAdventureById, getAdventureMessages } from "@/lib/postgres/repositories";
import { requireAuth } from "@/lib/auth-helper";

export default async function AdventureChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  try {
    // Get current user
    const { user } = await requireAuth();

    // Fetch adventure details from database
    const adventure = await getAdventureById(resolvedParams.id, user.id);
    if (!adventure) {
      redirect("/adventures/continue");
    }

    // Fetch messages for this adventure
    const messages = await getAdventureMessages(resolvedParams.id, 50);

    return (
      <div className="container mx-auto h-[calc(100vh-4rem)]">
        <AdventureChat adventure={adventure} initialMessages={messages} userId={user.id} />
      </div>
    );
  } catch (error) {
    console.error("Error loading adventure chat:", error);
    redirect("/adventures/continue");
  }
}
