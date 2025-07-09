import { requireAuth } from "@story-engine/auth";
import { AdventureTypeForm } from "@/components/adventure-types/adventure-type-form";

export default async function NewAdventureTypePage() {
  await requireAuth(); // Ensure user is authenticated

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Adventure Type</h1>
          <p className="text-muted-foreground mt-2">
            Design a custom adventure type with unique prompts and AI behavior settings
          </p>
        </div>

        <AdventureTypeForm />
      </div>
    </div>
  );
}
