import { AdventureChat } from "@/components/adventures/adventure-chat";
import { redirect } from "next/navigation";
import { getAdventureById, getAdventureMessages } from "@story-engine/postgres";
import { requireAuth } from "@story-engine/auth";
export default async function AdventureChatPage({ params }) {
    const resolvedParams = await params;
    try {
        const { user } = await requireAuth();
        const adventure = await getAdventureById(resolvedParams.id, user.id);
        if (!adventure) {
            redirect("/adventures/continue");
        }
        const messages = await getAdventureMessages(resolvedParams.id, 50);
        return (<div className="container mx-auto h-[calc(100vh-4rem)]">
        <AdventureChat adventure={adventure} initialMessages={messages} userId={user.id}/>
      </div>);
    }
    catch (error) {
        console.error("Error loading adventure chat:", error);
        redirect("/adventures/continue");
    }
}
