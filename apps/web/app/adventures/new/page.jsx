import { NewAdventureForm } from "@/components/adventures/new-adventure-form";
import { getCharactersByUser, getLocationsByUser, getSettingsByUser, } from "@story-engine/postgres";
import { requireAuth } from "@story-engine/auth";
export default async function NewAdventurePage() {
    try {
        const { user } = await requireAuth();
        const characters = await getCharactersByUser(user.id);
        const locations = await getLocationsByUser(user.id);
        const settings = await getSettingsByUser(user.id);
        return (<div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Start New Adventure</h1>
        <NewAdventureForm characters={characters} locations={locations} settings={settings} userId={user.id}/>
      </div>);
    }
    catch (error) {
        console.error("Error loading adventure form data:", error);
        return (<div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Start New Adventure</h1>
        <p className="text-red-500">Error loading form data. Please try again.</p>
      </div>);
    }
}
