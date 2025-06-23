import { createClient } from "@/lib/supabase/server";
import { LibraryCard } from "./library-card";
import { LibraryContainer } from "./library-container";
import { LibrarySearch } from "./library-search";
import { LibraryBreadcrumbs } from "@/components/navigation/library-breadcrumbs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileX } from "lucide-react";

const typeDisplayNames: Record<string, string> = {
  characters: "Characters",
  settings: "Settings", 
  locations: "Locations",
};

const typeDescriptions: Record<string, string> = {
  characters: "Manage your story characters and their details",
  settings: "Create and organize story settings and worlds",
  locations: "Build immersive locations for your stories",
};

export async function LibraryPage({ type }: { type: string }) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Build privacy-aware query based on entity type
  let query = supabase.from(type).select();
  
  if (user) {
    // Show items that are either:
    // 1. Owned by current user (regardless of privacy)
    // 2. Public items from other users
    if (type === 'characters') {
      query = query.or(`created_by.eq.${user.id},visibility.eq.public`);
    } else if (type === 'settings') {
      query = query.or(`created_by.eq.${user.id},is_private.eq.false`);
    } else if (type === 'locations') {
      query = query.or(`created_by.eq.${user.id},is_private.eq.false`);
    }
  } else {
    // Not logged in - only show public items
    if (type === 'characters') {
      query = query.eq('visibility', 'public');
    } else if (type === 'settings' || type === 'locations') {
      query = query.eq('is_private', false);
    }
  }
  
  const { data } = await query;
  
  const displayName = typeDisplayNames[type] || type;
  const description = typeDescriptions[type];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <LibraryBreadcrumbs type={type} />
      
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold capitalize">{displayName}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={`/${type}/new`} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New {displayName.slice(0, -1)}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <LibrarySearch type={type} />
      
      {data && data.length > 0 ? (
        <LibraryContainer>
          {data.map((item) => (
            <LibraryCard key={item.id} item={item} type={type} />
          ))}
        </LibraryContainer>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FileX className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No {displayName} Found</h3>
            <p className="text-muted-foreground max-w-md">
              You haven&apos;t created any {displayName.toLowerCase()} yet. 
              Create your first one to get started with your story library.
            </p>
          </div>
          <Button asChild>
            <Link href={`/${type}/new`} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First {displayName.slice(0, -1)}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
