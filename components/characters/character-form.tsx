"use client";

import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Character {
  id: number;
  name: string;
  age: number | null;
  gender: string | null;
  tags: string | null;
  appearance: string | null;
  fragrances: string | null;
  personality: string | null;
  background: string | null;
}

export function CharacterForm({ character }: { character: Character }) {
  const [edit, setEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: character.name ?? "",
    age: character.age ?? "",
    gender: character.gender ?? "Male",
    tags: character.tags ?? "",
    appearance: character.appearance ?? "",
    fragrances: character.fragrances ?? "",
    personality: character.personality ?? "",
    background: character.background ?? "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCancel = () => {
    setFormData({
      name: character.name ?? "",
      age: character.age ?? "",
      gender: character.gender ?? "Male",
      tags: character.tags ?? "",
      appearance: character.appearance ?? "",
      fragrances: character.fragrances ?? "",
      personality: character.personality ?? "",
      background: character.background ?? "",
    });
    setAvatarUrl(null);
    setEdit(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const supabase = createClient();
    await supabase
      .from("characters")
      .update({
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        tags: formData.tags,
        appearance: formData.appearance,
        fragrances: formData.fragrances,
        personality: formData.personality,
        background: formData.background,
      })
      .eq("id", character.id);
    setIsSaving(false);
    setEdit(false);
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4 p-4 max-w-2xl mx-auto">
      <div className="flex justify-center">
        <div className="relative h-32 w-32">
          <Image
            src={avatarUrl ?? "https://placehold.co/128.png"}
            alt="Avatar"
            fill
            className="rounded-full object-cover"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          readOnly={!edit}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          value={formData.age ?? ""}
          onChange={(e) => handleChange("age", e.target.value)}
          readOnly={!edit}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="gender">Gender</Label>
        <select
          id="gender"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={formData.gender ?? ""}
          onChange={(e) => handleChange("gender", e.target.value)}
          disabled={!edit}
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
          value={formData.tags ?? ""}
          onChange={(e) => handleChange("tags", e.target.value)}
          readOnly={!edit}
        />
      </div>
      {edit && (
        <div className="grid gap-2">
          <Label htmlFor="avatar">Avatar</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAvatarUrl(URL.createObjectURL(file));
              }
            }}
          />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="appearance">Appearance</Label>
        <Textarea
          id="appearance"
          value={formData.appearance}
          onChange={(e) => handleChange("appearance", e.target.value)}
          readOnly={!edit}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="fragrances">Scents &amp; Fragrances</Label>
        <Textarea
          id="fragrances"
          value={formData.fragrances}
          onChange={(e) => handleChange("fragrances", e.target.value)}
          readOnly={!edit}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="personality">Personality</Label>
        <Textarea
          id="personality"
          value={formData.personality}
          onChange={(e) => handleChange("personality", e.target.value)}
          readOnly={!edit}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="background">Background</Label>
        <Textarea
          id="background"
          value={formData.background}
          onChange={(e) => handleChange("background", e.target.value)}
          readOnly={!edit}
        />
      </div>
      {edit ? (
        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isSaving}>
            {isSaving ? "Updating..." : "Update"}
          </Button>
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button type="button" className="w-full" onClick={() => setEdit(true)}>
          Edit
        </Button>
      )}
    </form>
  );
}
