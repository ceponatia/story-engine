"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@supabase/supabase-js";

interface Location {
  id: string;
  name: string;
  description: string;
}

interface SettingLocation {
  location_id: string;
  locations: Location;
}

interface Setting {
  id: string;
  title: string;
  description: string | null;
  background: string | null;
  genre: string;
  is_private: boolean;
  created_by: string;
  setting_locations: SettingLocation[];
}

const GENRE_OPTIONS = ["Adventure", "Horror", "Romance", "Feet", "Seduction"];

export function SettingForm({ 
  setting, 
  currentUser 
}: { 
  setting: Setting;
  currentUser: User | null;
}) {
  const [edit, setEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canEdit = currentUser?.id === setting.created_by;
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    title: setting.title ?? "",
    description: setting.description ?? "",
    background: setting.background ?? "",
    genre: setting.genre ?? "Adventure",
    is_private: setting.is_private ?? false,
    selected_locations: setting.setting_locations?.map(sl => sl.location_id) ?? [],
  });

  useEffect(() => {
    const fetchLocations = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("locations").select("*");
      setLocations(data ?? []);
    };
    fetchLocations();
  }, []);

  const handleChange = (field: keyof typeof formData, value: string | boolean | string[]) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleLocationToggle = (locationId: string) => {
    const currentLocations = formData.selected_locations;
    if (currentLocations.includes(locationId)) {
      handleChange("selected_locations", currentLocations.filter(id => id !== locationId));
    } else if (currentLocations.length < 5) {
      handleChange("selected_locations", [...currentLocations, locationId]);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: setting.title ?? "",
      description: setting.description ?? "",
      background: setting.background ?? "",
      genre: setting.genre ?? "Adventure",
      is_private: setting.is_private ?? false,
      selected_locations: setting.setting_locations?.map(sl => sl.location_id) ?? [],
    });
    setEdit(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const supabase = createClient();

    // Update setting
    const { error: settingError } = await supabase
      .from("settings")
      .update({
        title: formData.title,
        description: formData.description,
        background: formData.background,
        genre: formData.genre,
        is_private: formData.is_private,
      })
      .eq("id", setting.id);

    if (settingError) {
      console.error("Error updating setting:", settingError);
      alert("Failed to update setting: " + settingError.message);
      setIsSaving(false);
      return;
    }

    // Update locations - delete existing and add new ones
    const { error: deleteError } = await supabase.from("setting_locations").delete().eq("setting_id", setting.id);
    
    if (deleteError) {
      console.error("Error deleting setting locations:", deleteError);
      alert("Failed to update locations: " + deleteError.message);
      setIsSaving(false);
      return;
    }
    
    if (formData.selected_locations.length > 0) {
      const locationInserts = formData.selected_locations.map(locationId => ({
        setting_id: setting.id,
        location_id: locationId,
      }));
      const { error: insertError } = await supabase.from("setting_locations").insert(locationInserts);
      
      if (insertError) {
        console.error("Error inserting setting locations:", insertError);
        alert("Failed to update locations: " + insertError.message);
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    setEdit(false);
    window.location.reload(); // Refresh to show updated data
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4 p-4 max-w-2xl mx-auto">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          maxLength={120}
          readOnly={!edit}
          required
        />
        <p className="text-sm text-gray-500">{formData.title.length}/120 characters</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          maxLength={120}
          readOnly={!edit}
        />
        <p className="text-sm text-gray-500">{formData.description.length}/120 characters</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="background">Background</Label>
        <Textarea
          id="background"
          value={formData.background}
          onChange={(e) => handleChange("background", e.target.value)}
          readOnly={!edit}
          className="min-h-32"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="genre">Genre</Label>
        <select
          id="genre"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={formData.genre}
          onChange={(e) => handleChange("genre", e.target.value)}
          disabled={!edit}
        >
          {GENRE_OPTIONS.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label>Locations (Select up to 5)</Label>
        {locations.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
            {locations.map(location => (
              <label key={location.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.selected_locations.includes(location.id)}
                  onChange={() => handleLocationToggle(location.id)}
                  disabled={!edit || (!formData.selected_locations.includes(location.id) && formData.selected_locations.length >= 5)}
                />
                <span className="text-sm">{location.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No locations available</p>
        )}
        <p className="text-sm text-gray-500">{formData.selected_locations.length}/5 selected</p>
      </div>

      {canEdit && (
        <div className="grid gap-2">
          <Label htmlFor="private">Private Setting</Label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="private"
              checked={formData.is_private}
              onChange={(e) => handleChange("is_private", e.target.checked)}
              disabled={!edit}
            />
            <span className="text-sm">
              {formData.is_private ? "Only visible to you" : "Visible to everyone"}
            </span>
          </div>
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
          You can only edit settings you created.
        </div>
      )}
      
      <div className="text-xs text-muted-foreground text-center space-y-1">
        {setting.is_private && (
          <div className="text-amber-600">🔒 Private</div>
        )}
      </div>
    </form>
  );
}