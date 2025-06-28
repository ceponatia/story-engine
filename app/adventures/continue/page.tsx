import { AdventuresList } from "@/components/adventures/adventures-list";
import { getAdventuresByUser } from "@/lib/database/queries";
import { requireAuth } from "@/lib/auth-helper";

export default async function ContinueAdventurePage() {
  try {
    // Get current user
    const { user } = await requireAuth();

    // Fetch user's adventures from database
    const adventures = await getAdventuresByUser(user.id);

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Continue Your Adventures</h1>
        <AdventuresList adventures={adventures} />
      </div>
    );
  } catch (error) {
    console.error('Error loading adventures:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Continue Your Adventures</h1>
        <p className="text-red-500">Error loading adventures. Please try again.</p>
      </div>
    );
  }
}