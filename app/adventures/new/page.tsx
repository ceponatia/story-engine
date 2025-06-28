import { NewAdventureForm } from "@/components/adventures/new-adventure-form";
import { getCharactersByUser, getLocationsByUser, getSettingsByUser } from "@/lib/database/queries";
import { requireAuth } from "@/lib/auth-helper";

export default async function NewAdventurePage() {
  try {
    // Get current user
    const { user } = await requireAuth();

    // Fetch user's characters from database
    const characters = await getCharactersByUser(user.id);

    // Fetch user's locations from database
    const locations = await getLocationsByUser(user.id);

    // Fetch user's settings from database
    const settings = await getSettingsByUser(user.id);

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Start New Adventure</h1>
        <NewAdventureForm 
          characters={characters} 
          locations={locations}
          settings={settings}
          userId={user.id}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading adventure form data:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Start New Adventure</h1>
        <p className="text-red-500">Error loading form data. Please try again.</p>
      </div>
    );
  }
}