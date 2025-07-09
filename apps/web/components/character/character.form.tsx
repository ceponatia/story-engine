"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createCharacterAction, updateCharacterAction } from "@/lib/actions/character.actions";
import type { Character, CharacterFormData } from "@story-engine/types";
import { attributeToText } from "@story-engine/domain-characters";
import { characterCreateSchema, characterUpdateSchema } from "@story-engine/validation";
import { cn } from "@/lib/utils";
import { Save } from "lucide-react";
import { AvatarUpload } from "./avatarUpload";

interface User {
  id: string;
  email?: string;
  name?: string;
}

type Mode = "view" | "edit" | "create";

interface UnifiedCharacterFormProps {
  mode: Mode;
  character?: Character | null;
  currentUser: User | null;
  onModeChange: (newMode: Mode) => void;
  showEditButton?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export function UnifiedCharacterForm({
  mode,
  character,
  currentUser,
  onModeChange,
  showEditButton = true,
  onSubmittingChange,
}: UnifiedCharacterFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);

  const canEdit = currentUser?.id === character?.user_id;
  const isFormMode = mode === "edit" || mode === "create";

  // Helper function to extract attribute text from structured JSONB using unified parser
  const extractAttributeText = (attributeData: any) => {
    if (!attributeData) return "";

    // If it's already a string (old format), return as-is
    if (typeof attributeData === "string") {
      return attributeData;
    }

    // If it's an array (old scents format), join as string
    if (Array.isArray(attributeData)) {
      return attributeData.join(", ");
    }

    // Use unified parser to convert JSONB back to natural language
    try {
      return attributeToText(attributeData);
    } catch (error) {
      console.error("Error extracting attribute text:", error);
      return typeof attributeData === "object"
        ? JSON.stringify(attributeData)
        : String(attributeData);
    }
  };

  const [formData, setFormData] = useState({
    name: character?.name ?? "",
    age: character?.age?.toString() ?? "",
    gender: character?.gender ?? "Male",
    appearance: extractAttributeText(character?.appearance),
    scents_aromas: extractAttributeText(character?.scents_aromas),
    personality: extractAttributeText(character?.personality),
    background: character?.background ?? "",
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(character?.avatar_url || null);

  // Reset form data when character changes (for navigation between characters)
  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name ?? "",
        age: character.age?.toString() ?? "",
        gender: character.gender ?? "Male",
        appearance: extractAttributeText(character.appearance),
        scents_aromas: extractAttributeText(character.scents_aromas),
        personality: extractAttributeText(character.personality),
        background: character.background ?? "",
      });
      setAvatarUrl(character.avatar_url || null);
    } else if (mode === "create") {
      // Reset form for create mode
      setFormData({
        name: "",
        age: "",
        gender: "Male",
        appearance: "",
        scents_aromas: "",
        personality: "",
        background: "",
      });
      setAvatarUrl(null);
    }
  }, [character, mode]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateFormData = () => {
    const formDataForValidation = {
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender as "Male" | "Female" | "Other" | "Unknown",
      appearance: formData.appearance,
      scents_aromas: formData.scents_aromas,
      personality: formData.personality,
      background: formData.background,
      avatar_url: avatarUrl || undefined,
    };

    const schema = mode === "create" ? characterCreateSchema : characterUpdateSchema;
    const result = schema.safeParse(formDataForValidation);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);
      const missingFields = result.error.issues.map((issue) => issue.path[0] as string);
      return { errors, missingFields };
    }

    return { errors: [], missingFields: [] };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { errors, missingFields } = validateFormData();

    if (errors.length > 0) {
      setValidationErrors(missingFields);
      setValidationMessages(errors);
      setShowValidationModal(true);
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);
    setValidationMessages([]);
    onSubmittingChange?.(true);

    try {
      if (mode === "create") {
        await createCharacterAction({
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          appearance: formData.appearance,
          scents_aromas: formData.scents_aromas || undefined,
          personality: formData.personality,
          background: formData.background,
          avatar_url: avatarUrl || undefined,
        });
        // If we reach here, the action succeeded and redirect will happen
      } else if (mode === "edit" && character) {
        const updateData: CharacterFormData = {
          name: formData.name,
          age:
            formData.age && !isNaN(parseInt(formData.age)) ? parseInt(formData.age) : character.age,
          gender: formData.gender,
          appearance: formData.appearance,
          scents_aromas: formData.scents_aromas || undefined,
          personality: formData.personality,
          background: formData.background,
          avatar_url: avatarUrl || undefined,
        };

        await updateCharacterAction(character.id, updateData);

        // Switch to view mode and refresh
        onModeChange("view");
        router.refresh();
      }
    } catch (error) {
      // Check if this is a Next.js redirect error (which is expected on success for create)
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        String(error.digest).startsWith("NEXT_REDIRECT")
      ) {
        // This is a successful redirect, don't treat it as an error
        return;
      }

      console.error(`Error ${mode === "create" ? "creating" : "updating"} character:`, error);
      alert(`Failed to ${mode === "create" ? "create" : "update"} character. Please try again.`);
      setIsSubmitting(false);
      onSubmittingChange?.(false);
    }
  };

  const renderModeButton = () => {
    if (mode === "view") {
      // Only show edit button at bottom if showEditButton prop is true
      if (!showEditButton) return null;

      return canEdit ? (
        <Button type="button" className="w-full" onClick={() => onModeChange("edit")}>
          Edit
        </Button>
      ) : (
        <div className="text-sm text-muted-foreground text-center">
          You can only edit characters you created.
        </div>
      );
    }

    if (mode === "create") {
      return (
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Creating..." : "Create Character"}
          </Button>
        </div>
      );
    }

    // Don't render buttons for edit mode since they're now in the header
    return null;
  };

  return (
    <form id="character-form" onSubmit={handleSubmit} className="space-y-4 p-4 max-w-2xl mx-auto">
      {/* Avatar display/upload - now square and left-aligned */}
      <div className="flex items-start gap-6">
        <div className="relative h-32 w-32 flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${formData.name || "Character"} Avatar`}
              fill
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
              No Avatar
            </div>
          )}
        </div>

        {/* Upload area - only show in create mode */}
        {mode === "create" && <AvatarUpload onUpload={setAvatarUrl} />}
      </div>

      {/* Form fields */}
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          maxLength={120}
          onChange={(e) => handleChange("name", e.target.value)}
          readOnly={!isFormMode}
          required={isFormMode}
          className={cn(
            validationErrors.includes("name") && "border-red-500 focus-visible:ring-red-500"
          )}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          value={formData.age}
          max={9999}
          onChange={(e) => handleChange("age", e.target.value)}
          readOnly={!isFormMode}
          required={isFormMode}
          className={cn(
            validationErrors.includes("age") && "border-red-500 focus-visible:ring-red-500"
          )}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="gender">Gender</Label>
        <select
          id="gender"
          className={cn(
            "rounded-md border border-input bg-background px-3 py-2 text-sm",
            validationErrors.includes("gender") && "border-red-500 focus:ring-red-500"
          )}
          value={formData.gender}
          onChange={(e) => handleChange("gender", e.target.value)}
          disabled={!isFormMode}
          required={isFormMode}
        >
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
          <option>Unknown</option>
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="appearance">Appearance</Label>
        <Textarea
          id="appearance"
          value={formData.appearance}
          onChange={(e) => handleChange("appearance", e.target.value)}
          readOnly={!isFormMode}
          required={isFormMode}
          className={cn(
            validationErrors.includes("appearance") && "border-red-500 focus-visible:ring-red-500"
          )}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="scents_aromas">Scents &amp; Fragrances</Label>
        <Textarea
          id="scents_aromas"
          value={formData.scents_aromas}
          onChange={(e) => handleChange("scents_aromas", e.target.value)}
          readOnly={!isFormMode}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="personality">Personality</Label>
        <Textarea
          id="personality"
          value={formData.personality}
          onChange={(e) => handleChange("personality", e.target.value)}
          readOnly={!isFormMode}
          required={isFormMode}
          className={cn(
            validationErrors.includes("personality") && "border-red-500 focus-visible:ring-red-500"
          )}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="background">Background</Label>
        <Textarea
          id="background"
          value={formData.background}
          onChange={(e) => handleChange("background", e.target.value)}
          readOnly={!isFormMode}
          required={isFormMode}
          className={cn(
            validationErrors.includes("background") && "border-red-500 focus-visible:ring-red-500"
          )}
        />
      </div>

      {/* Mode-specific action buttons */}
      {renderModeButton()}

      {/* Character metadata - only show in view mode */}
      {mode === "view" && character && (
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div>Created: {new Date(character.created_at).toLocaleDateString()}</div>
          <div>Updated: {new Date(character.updated_at).toLocaleDateString()}</div>
          {character.private && <div className="text-amber-600">🔒 Private</div>}
        </div>
      )}

      {/* Validation modal */}
      <AlertDialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Missing Required Fields</AlertDialogTitle>
            <AlertDialogDescription>
              Please fix the following validation errors:
              <ul className="mt-2 list-disc pl-5">
                {validationMessages.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowValidationModal(false)}>OK</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
