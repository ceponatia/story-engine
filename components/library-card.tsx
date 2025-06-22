import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  item: { id: number; name: string; description?: string };
}

export function LibraryCard({ item }: Props) {
  return (
    <Card className="flex flex-col aspect-[3/4] overflow-hidden">
      <CardHeader className="flex-none">
        <CardTitle className="truncate text-xl">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto text-sm">
        {item.description}
      </CardContent>
    </Card>
  );
}
