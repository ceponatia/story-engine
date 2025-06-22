import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  item: { id: number; name: string; description?: string };
  type: string;
}

export function LibraryCard({ item, type }: Props) {
  return (
    <Link href={`/${type}/${item.id}`}> 
      <Card className="peel-card flex flex-col aspect-[3/4]">
        <CardHeader className="flex-none">
          <CardTitle className="truncate text-xl">{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto text-sm">
          {item.description}
        </CardContent>
      </Card>
    </Link>
  );
}
