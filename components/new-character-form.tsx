"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewCharacterForm() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [tags, setTags] = useState("");
  const [appearance, setAppearance] = useState("");
  const [fragrances, setFragrances] = useState("");
  const [personality, setPersonality] = useState("");
  const [background, setBackground] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: submit to supabase
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          max={9999}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="gender">Gender</Label>
        <select
          id="gender"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
          <option>Unknown</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="comma separated"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="avatar">Avatar</Label>
        <Input id="avatar" type="file" accept="image/*" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="appearance">Appearance</Label>
        <Textarea
          id="appearance"
          value={appearance}
          onChange={(e) => setAppearance(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="fragrances">Scents &amp; Fragrances</Label>
        <Textarea
          id="fragrances"
          value={fragrances}
          onChange={(e) => setFragrances(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="personality">Personality</Label>
        <Textarea
          id="personality"
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="background">Background</Label>
        <Textarea
          id="background"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">
        Save Character
      </Button>
    </form>
  );
}
