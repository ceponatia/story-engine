"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Location {
  id: string;
  name: string;
  description: string;
}

const GENRE_OPTIONS = ["Adventure", "Horror", "Romance", "Feet", "Seduction"];

export function NewSettingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    background: "",
    genre: "Adventure",
    is_private: false,
    selected_locations: [] as string[],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to create a setting");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create setting
      const { data: setting, error: settingError } = await supabase
        .from("settings")
        .insert({
          title: formData.title,
          description: formData.description,
          background: formData.background,
          genre: formData.genre,
          is_private: formData.is_private,
          created_by: user.id,
        })
        .select()
        .single();

      if (settingError) {
        throw settingError;
      }

      // Add locations if any selected
      if (formData.selected_locations.length > 0) {
        const locationInserts = formData.selected_locations.map(locationId => ({
          setting_id: setting.id,
          location_id: locationId,
        }));
        
        const { error: locationError } = await supabase
          .from("setting_locations")
          .insert(locationInserts);

        if (locationError) {
          throw locationError;
        }
      }

      // Redirect to the new setting
      router.push(`/settings/${setting.id}`);
    } catch (error) {
      console.error("Error creating setting:", error);
      alert("Failed to create setting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          maxLength={120}
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
        />
        <p className="text-sm text-gray-500">{formData.description.length}/120 characters</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="background">Background</Label>
        <Textarea
          id="background"
          value={formData.background}
          onChange={(e) => handleChange("background", e.target.value)}
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
                  disabled={!formData.selected_locations.includes(location.id) && formData.selected_locations.length >= 5}
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

      <div className="grid gap-2">
        <Label htmlFor="private">Private Setting</Label>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="private"
            checked={formData.is_private}
            onChange={(e) => handleChange("is_private", e.target.checked)}
          />
          <span className="text-sm">
            {formData.is_private ? "Only visible to you" : "Visible to everyone"}
          </span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Setting"}
      </Button>
    </form>
  );
}