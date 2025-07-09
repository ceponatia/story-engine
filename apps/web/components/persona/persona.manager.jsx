"use client";
import { useState } from "react";
import { UnifiedPersonaForm } from "./unified-persona-form";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, Trash2 } from "lucide-react";
import { deletePersonaAction } from "@/lib/actions/persona-actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
export function UnifiedPersonaManager({ persona, currentUser, initialMode, onPersonaUpdate, onPersonaDelete, }) {
    const [mode, setMode] = useState(initialMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const getPageTitle = () => {
        switch (mode) {
            case "create":
                return "Create New Persona";
            case "edit":
                return `Edit ${(persona === null || persona === void 0 ? void 0 : persona.name) || "Persona"}`;
            case "view":
            default:
                return (persona === null || persona === void 0 ? void 0 : persona.name) || "Persona";
        }
    };
    const canEdit = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) === (persona === null || persona === void 0 ? void 0 : persona.created_by);
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
    const handleDelete = async () => {
        if (!persona)
            return;
        setIsDeleting(true);
        try {
            await deletePersonaAction(persona.id);
            onPersonaDelete === null || onPersonaDelete === void 0 ? void 0 : onPersonaDelete();
        }
        catch (error) {
            console.error("Error deleting persona:", error);
        }
        finally {
            setIsDeleting(false);
        }
    };
    return (<div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between my-4">
        <h1 className="text-2xl font-bold">{getPageTitle()}</h1>

        <div className="flex gap-2">
          {showEditButton && (<>
              <Button onClick={() => setMode("edit")} size="sm" className="gap-2">
                <Edit className="h-4 w-4"/>
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4"/>
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Persona</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this persona? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex justify-end gap-2">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </>)}

          {showUpdateButtons && (<div className="flex gap-2">
              <Button type="submit" form="persona-form" size="sm" disabled={isSubmitting} className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Save className="h-4 w-4"/>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleCancel} className="gap-2">
                <X className="h-4 w-4"/>
                Cancel
              </Button>
            </div>)}
        </div>
      </div>

      <UnifiedPersonaForm mode={mode} persona={persona} currentUser={currentUser} onModeChange={setMode} onSubmittingChange={setIsSubmitting} onPersonaUpdate={onPersonaUpdate}/>
    </div>);
}
