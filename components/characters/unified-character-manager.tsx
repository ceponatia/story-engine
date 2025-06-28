"use client";

import { useState } from "react";
import { Character } from "@/lib/database/types";
import { UnifiedCharacterForm } from "./unified-character-form";
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";

interface User {
  id: string;
  email?: string;
  name?: string;
}

type Mode = 'view' | 'edit' | 'create';

interface UnifiedCharacterManagerProps {
  character: Character | null;
  currentUser: User | null;
  initialMode: Mode;
}

export function UnifiedCharacterManager({ 
  character, 
  currentUser, 
  initialMode 
}: UnifiedCharacterManagerProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPageTitle = () => {
    switch (mode) {
      case 'create':
        return "Create New Character";
      case 'edit':
        return `Edit ${character?.name || 'Character'}`;
      case 'view':
      default:
        return character?.name || "Character";
    }
  };

  const canEdit = currentUser?.id === character?.created_by;
  const showEditButton = mode === 'view' && canEdit;
  const showUpdateButtons = mode === 'edit';

  const handleCancel = () => {
    if (mode === 'create') {
      // For create mode, this will be handled by the form
      return;
    } else {
      setMode('view');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between my-4">
        <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
        
        {showEditButton && (
          <Button 
            onClick={() => setMode('edit')}
            size="sm"
            className="ml-4 gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}

        {showUpdateButtons && (
          <div className="flex gap-2 ml-4">
            <Button 
              type="submit"
              form="character-form"
              size="sm"
              disabled={isSubmitting}
              className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Save className="h-4 w-4" />
              {isSubmitting 
                ? (mode === 'create' ? "Creating..." : "Updating...") 
                : (mode === 'create' ? "Create" : "Update")
              }
            </Button>
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
      
      <UnifiedCharacterForm 
        mode={mode}
        character={character}
        currentUser={currentUser}
        onModeChange={setMode}
        showEditButton={false}
        onSubmittingChange={setIsSubmitting}
      />
    </div>
  );
}