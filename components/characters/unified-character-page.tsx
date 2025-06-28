import { LibraryBreadcrumbs } from "@/components/navigation/library-breadcrumbs";
import { getCharacterAction } from "@/lib/actions/character-actions";
import { getCurrentUserAction } from "@/lib/actions/user-actions";
import { Character } from "@/lib/database/types";
import { UnifiedCharacterManager } from "./unified-character-manager";

interface UnifiedCharacterPageProps {
  id: string;
  initialMode?: 'view' | 'edit' | 'create';
}

export async function UnifiedCharacterPage({ id, initialMode = 'view' }: UnifiedCharacterPageProps) {
  let data: Character | null = null;
  let user: { id: string; email?: string; name?: string } | null = null;
  
  // For 'new' route, we don't need to fetch character data
  const isCreateMode = id === 'new';
  
  try {
    if (isCreateMode) {
      user = await getCurrentUserAction();
    } else {
      [data, user] = await Promise.all([
        getCharacterAction(id),
        getCurrentUserAction()
      ]);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  // Handle character not found for non-create modes
  if (!isCreateMode && !data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LibraryBreadcrumbs type="characters" />
        <p className="p-4 text-center">Character not found or you don&apos;t have permission to view it.</p>
      </div>
    );
  }

  const mode = isCreateMode ? 'create' : initialMode;
  const characterName = isCreateMode ? undefined : data?.name;
  const characterId = isCreateMode ? undefined : id;

  return (
    <div className="container mx-auto px-4 py-6">
      <LibraryBreadcrumbs 
        type="characters" 
        itemName={characterName} 
        itemId={characterId} 
      />
      <UnifiedCharacterManager 
        character={data} 
        currentUser={user} 
        initialMode={mode}
      />
    </div>
  );
}