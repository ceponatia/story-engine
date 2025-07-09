"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface Adventure {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  characters?: { name: string };
  locations?: { name: string };
}

interface AdventuresListProps {
  adventures: Adventure[];
}

export function AdventuresList({ adventures }: AdventuresListProps) {
  if (adventures.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">You don&apos;t have any active adventures yet.</p>
        <Link href="/adventures/new">
          <Button>Start Your First Adventure</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {adventures.map((adventure) => (
        <Card key={adventure.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>{adventure.title}</CardTitle>
            <CardDescription>
              Playing as {adventure.characters?.name}
              {adventure.locations && ` in ${adventure.locations.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Last played: {new Date(adventure.updated_at).toLocaleDateString()}
              </p>
              <Link href={`/adventures/${adventure.id}/chat`}>
                <Button size="sm">
                  <Play className="mr-2 h-4 w-4" />
                  Continue
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
