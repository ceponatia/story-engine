"use client";

import { useState } from "react";
import { createAdventure } from "@/lib/actions/adventures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Character, Location, Setting } from "@story-engine/types";

interface NewAdventureFormProps {
  characters: Character[];
  locations: Location[];
  settings: Setting[];
  userId: string;
}

export function NewAdventureForm({ characters, locations, settings }: NewAdventureFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsCreating(true);
    setError(null);

    try {
      await createAdventure(formData);
    } catch (error) {
      console.error("Error creating adventure:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create adventure. Please try again."
      );
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
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name (how the character will refer to you)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adventureType">Adventure Type</Label>
            <Select name="adventureType" required>
              <SelectTrigger id="adventureType">
                <SelectValue placeholder="Choose the type of adventure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="action">Action</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="characterId">AI Character</Label>
            <Select name="characterId" required>
              <SelectTrigger id="characterId">
                <SelectValue placeholder="Choose the character the AI will play" />
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

          {settings.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="settingId">Setting (Optional)</Label>
              <Select name="settingId">
                <SelectTrigger id="settingId">
                  <SelectValue placeholder="Choose a setting for your adventure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {settings.map((setting) => (
                    <SelectItem key={setting.id} value={setting.id}>
                      {setting.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="initialMessage">Initial Message</Label>
            <Textarea
              id="initialMessage"
              name="initialMessage"
              placeholder="Enter the character's opening message to start the adventure..."
              rows={3}
              required
            />
            <p className="text-sm text-muted-foreground">
              This message will appear as the character&apos;s first response when the adventure
              begins.
            </p>
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
