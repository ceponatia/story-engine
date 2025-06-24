"use client";

import { useState } from "react";
import { createAdventure } from "@/app/actions/adventures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Character {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  tags: string | null;
  appearance: string | null;
  scents_aromas: string | null;
  personality: string | null;
  background: string | null;
  created_by: string;
  visibility: string;
}

interface Location {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
}

interface NewAdventureFormProps {
  characters: Character[];
  locations: Location[];
  userId: string;
}

export function NewAdventureForm({ characters, locations }: NewAdventureFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsCreating(true);
    setError(null);

    try {
      await createAdventure(formData);
    } catch (error) {
      console.error("Error creating adventure:", error);
      setError(error instanceof Error ? error.message : "Failed to create adventure. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Adventure</CardTitle>
        <CardDescription>
          Choose a character and setting to begin your interactive story
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Adventure Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter a title for your adventure"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="characterId">Select Character</Label>
            <Select name="characterId" required>
              <SelectTrigger id="characterId">
                <SelectValue placeholder="Choose a character to play as" />
              </SelectTrigger>
              <SelectContent>
                {characters.map((character) => (
                  <SelectItem key={character.id} value={character.id}>
                    {character.name} {character.age && `(${character.age})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {locations.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="locationId">Select Location (Optional)</Label>
              <Select name="locationId">
                <SelectTrigger id="locationId">
                  <SelectValue placeholder="Choose a starting location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="settingDescription">Setting Description (Optional)</Label>
            <Textarea
              id="settingDescription"
              name="settingDescription"
              placeholder="Describe the setting or scenario for your adventure..."
              rows={4}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Start Adventure"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}