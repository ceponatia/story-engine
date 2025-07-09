import { notFound } from "next/navigation";
import { requireAuth } from "@story-engine/auth";
import { getUserAdventureTypeById } from "@story-engine/postgres";
import { AdventureTypeForm } from "@/components/adventure-types/adventure-type-form";
import { AdventureTypeView } from "@/components/adventure-types/adventure-type-view";

interface AdventureTypePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdventureTypePage({ params }: AdventureTypePageProps) {
  const { user } = await requireAuth();
  const { id } = await params;

  // Try to get user's adventure type first
  let adventureType = await getUserAdventureTypeById(id, user.id);
  let canEdit = true;

  // If not found, check if it's a public adventure type
  if (!adventureType) {
    // For public types, we need to find by ID differently
    // This is a simplified approach - you might want to enhance this
    const publicTypes = await import("@/lib/postgres/repositories").then((m) =>
      m.getPublicAdventureTypes(100)
    );
    adventureType = publicTypes.find((t: { id: string }) => t.id === id);
    canEdit = false;
  }

  if (!adventureType) {
    notFound();
  }

  const isOwner = adventureType.created_by === user.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {canEdit && isOwner ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Edit Adventure Type</h1>
              <p className="text-muted-foreground mt-2">
                Modify your custom adventure type settings and template
              </p>
            </div>
            <AdventureTypeForm adventureType={adventureType} isEditing={true} />
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold capitalize">
                {adventureType.name.replace(/_/g, " ")} Adventure Type
              </h1>
              <p className="text-muted-foreground mt-2">
                {adventureType.is_public ? "Public adventure type" : "View adventure type details"}
              </p>
            </div>
            <AdventureTypeView adventureType={adventureType} />
          </>
        )}
      </div>
    </div>
  );
}
