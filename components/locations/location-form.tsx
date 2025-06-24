"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@supabase/supabase-js";

interface Location {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export function LocationForm({ 
  location, 
  currentUser 
}: { 
  location: Location;
  currentUser: User | null;
}) {
  const [edit, setEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canEdit = currentUser?.id === location.created_by;
  const [formData, setFormData] = useState({
    name: location.name ?? "",
    description: location.description ?? "",
    is_private: location.is_private ?? false,
  });

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCancel = () => {
    setFormData({
      name: location.name ?? "",
      description: location.description ?? "",
      is_private: location.is_private ?? false,
    });
    setEdit(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("locations")
      .update({
        name: formData.name,
        description: formData.description,
        is_private: formData.is_private,
        updated_at: new Date().toISOString(),
      })
      .eq("id", location.id);
    
    if (error) {
      console.error("Error updating location:", error);
      alert("Failed to update location: " + error.message);
    } else {
      setEdit(false);
      // Optionally refresh the page to show updated data
      window.location.reload();
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4 p-4 max-w-2xl mx-auto">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          readOnly={!edit}
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          readOnly={!edit}
          placeholder="Describe this location..."
          className="min-h-[120px]"
        />
      </div>

      {canEdit && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_private"
            checked={formData.is_private}
            onCheckedChange={(checked) => handleChange("is_private", checked as boolean)}
            disabled={!edit}
          />
          <Label htmlFor="is_private" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Private (only visible to you)
          </Label>
        </div>
      )}

      {canEdit ? (
        edit ? (
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
        )
      ) : (
        <div className="text-sm text-muted-foreground text-center">
          You can only edit locations you created.
        </div>
      )}
      
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div>Created: {new Date(location.created_at).toLocaleDateString()}</div>
        <div>Updated: {new Date(location.updated_at).toLocaleDateString()}</div>
        {location.is_private && <div className="text-amber-600">🔒 Private</div>}
      </div>
    </form>
  );
}