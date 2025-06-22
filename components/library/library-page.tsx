import { createClient } from "@/lib/supabase/server";
import { LibraryCard } from "./library-card";
import { LibraryContainer } from "./library-container";

export async function LibraryPage({ type }: { type: string }) {
  const supabase = await createClient();
  const { data } = await supabase.from(type).select();

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold capitalize">{type} Library</h1>
      <LibraryContainer>
        {data && data.length > 0 ? (
          data.map((item) => (
            <LibraryCard key={item.id} item={item} type={type} />
          ))
        ) : (
          <p className="col-span-full text-center">No records found.</p>
        )}
      </LibraryContainer>
    </div>
  );
}
