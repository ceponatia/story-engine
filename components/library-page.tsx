import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function LibraryPage({ type }: { type: string }) {
  const supabase = await createClient();
  const { data } = await supabase.from(type).select();

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold capitalize">{type} Library</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {data && data.length > 0 ? (
          data.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent>{item.description}</CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center">No records found.</p>
        )}
      </div>
    </div>
  );
}
