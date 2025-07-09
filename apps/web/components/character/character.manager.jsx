"use client";
import { useState } from "react";
import { UnifiedCharacterForm } from "./unified-character-form";
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";
export function UnifiedCharacterManager({ character, currentUser, initialMode, }) {
    const [mode, setMode] = useState(initialMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const getPageTitle = () => {
        switch (mode) {
            case "create":
                return "Create New Character";
            case "edit":
                return `Edit ${(character === null || character === void 0 ? void 0 : character.name) || "Character"}`;
            case "view":
            default:
                return (character === null || character === void 0 ? void 0 : character.name) || "Character";
        }
    };
    const canEdit = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) === (character === null || character === void 0 ? void 0 : character.user_id);
    const showEditButton = mode === "view" && canEdit;
    const showUpdateButtons = mode === "edit";
    const handleCancel = () => {
        if (mode === "create") {
            return;
        }
        else {
            setMode("view");
        }
    };
    return (<div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between my-4">
        <h1 className="text-2xl font-bold">{getPageTitle()}</h1>

        {showEditButton && (<Button onClick={() => setMode("edit")} size="sm" className="ml-4 gap-2">
            <Edit className="h-4 w-4"/>
            Edit
          </Button>)}

        {showUpdateButtons && (<div className="flex gap-2 ml-4">
            <Button type="submit" form="character-form" size="sm" disabled={isSubmitting} className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
              <Save className="h-4 w-4"/>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleCancel} className="gap-2">
              <X className="h-4 w-4"/>
              Cancel
            </Button>
          </div>)}
      </div>

      <UnifiedCharacterForm mode={mode} character={character} currentUser={currentUser} onModeChange={setMode} showEditButton={false} onSubmittingChange={setIsSubmitting}/>
    </div>);
}
