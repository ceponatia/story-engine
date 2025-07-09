"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { createSettingAction, updateSettingAction } from "@/lib/actions/setting-actions";
import { cn } from "@/lib/utils";
import { Save } from "lucide-react";
const WORLD_TYPE_OPTIONS = [
    "Fantasy",
    "Sci-Fi",
    "Modern",
    "Historical",
    "Post-Apocalyptic",
    "Cyberpunk",
    "Steampunk",
    "Other",
];
export function UnifiedSettingForm({ mode, setting, currentUser, onModeChange, showEditButton = true, onSubmittingChange, }) {
    var _a, _b, _c, _d;
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const canEdit = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) === (setting === null || setting === void 0 ? void 0 : setting.user_id);
    const isFormMode = mode === "edit" || mode === "create";
    const [formData, setFormData] = useState({
        name: (_a = setting === null || setting === void 0 ? void 0 : setting.name) !== null && _a !== void 0 ? _a : "",
        description: (_b = setting === null || setting === void 0 ? void 0 : setting.description) !== null && _b !== void 0 ? _b : "",
        world_type: (_c = setting === null || setting === void 0 ? void 0 : setting.world_type) !== null && _c !== void 0 ? _c : "",
        history: (_d = setting === null || setting === void 0 ? void 0 : setting.history) !== null && _d !== void 0 ? _d : "",
        tags: Array.isArray(setting === null || setting === void 0 ? void 0 : setting.tags) ? setting.tags.join(", ") : "",
    });
    useEffect(() => {
        var _a, _b, _c, _d;
        if (setting) {
            setFormData({
                name: (_a = setting.name) !== null && _a !== void 0 ? _a : "",
                description: (_b = setting.description) !== null && _b !== void 0 ? _b : "",
                world_type: (_c = setting.world_type) !== null && _c !== void 0 ? _c : "",
                history: (_d = setting.history) !== null && _d !== void 0 ? _d : "",
                tags: Array.isArray(setting.tags) ? setting.tags.join(", ") : "",
            });
        }
        else if (mode === "create") {
            setFormData({
                name: "",
                description: "",
                world_type: "",
                history: "",
                tags: "",
            });
        }
    }, [setting, mode]);
    const handleChange = (field, value) => {
        setFormData(Object.assign(Object.assign({}, formData), { [field]: value }));
    };
    const validateRequiredFields = () => {
        const errors = [];
        const missingFields = [];
        if (!formData.name.trim()) {
            errors.push("Name is required");
            missingFields.push("name");
        }
        return { errors, missingFields };
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { errors, missingFields } = validateRequiredFields();
        if (errors.length > 0) {
            setValidationErrors(missingFields);
            setShowValidationModal(true);
            return;
        }
        setIsSubmitting(true);
        setValidationErrors([]);
        onSubmittingChange === null || onSubmittingChange === void 0 ? void 0 : onSubmittingChange(true);
        try {
            if (mode === "create") {
                await createSettingAction({
                    name: formData.name,
                    description: formData.description || undefined,
                    world_type: formData.world_type || undefined,
                    history: formData.history || undefined,
                    tags: formData.tags || undefined,
                });
            }
            else if (mode === "edit" && setting) {
                const updateData = {
                    name: formData.name,
                    description: formData.description || undefined,
                    world_type: formData.world_type || undefined,
                    history: formData.history || undefined,
                    tags: formData.tags || undefined,
                };
                await updateSettingAction(setting.id, updateData);
                onModeChange("view");
                router.refresh();
            }
        }
        catch (error) {
            if (error &&
                typeof error === "object" &&
                "digest" in error &&
                String(error.digest).startsWith("NEXT_REDIRECT")) {
                return;
            }
            console.error(`Error ${mode === "create" ? "creating" : "updating"} setting:`, error);
            alert(`Failed to ${mode === "create" ? "create" : "update"} setting. Please try again.`);
            setIsSubmitting(false);
            onSubmittingChange === null || onSubmittingChange === void 0 ? void 0 : onSubmittingChange(false);
        }
    };
    const renderModeButton = () => {
        if (mode === "view") {
            if (!showEditButton)
                return null;
            return canEdit ? (<Button type="button" className="w-full" onClick={() => onModeChange("edit")}>
          Edit
        </Button>) : (<div className="text-sm text-muted-foreground text-center">
          You can only edit settings you created.
        </div>);
        }
        if (mode === "create") {
            return (<div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4"/>
            {isSubmitting ? "Creating..." : "Create Setting"}
          </Button>
        </div>);
        }
        return null;
    };
    return (<form id="setting-form" onSubmit={handleSubmit} className="space-y-4 p-4 max-w-2xl mx-auto">
      
      <div className="grid gap-2">
        <Label htmlFor="name">Setting Name</Label>
        <Input id="name" value={formData.name} maxLength={255} onChange={(e) => handleChange("name", e.target.value)} readOnly={!isFormMode} required={isFormMode} className={cn(validationErrors.includes("name") && "border-red-500 focus-visible:ring-red-500")}/>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} readOnly={!isFormMode} placeholder="Brief description of this setting..."/>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="world_type">World Type</Label>
        <select id="world_type" className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.world_type} onChange={(e) => handleChange("world_type", e.target.value)} disabled={!isFormMode}>
          <option value="">Select world type...</option>
          {WORLD_TYPE_OPTIONS.map((type) => (<option key={type} value={type}>
              {type}
            </option>))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="history">History</Label>
        <Textarea id="history" value={formData.history} onChange={(e) => handleChange("history", e.target.value)} readOnly={!isFormMode} placeholder="Describe important historical events..." className="min-h-24"/>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="tags">Tags</Label>
        <Input id="tags" value={formData.tags} onChange={(e) => handleChange("tags", e.target.value)} readOnly={!isFormMode} placeholder="Comma-separated tags"/>
      </div>

      
      {renderModeButton()}

      
      {mode === "view" && setting && (<div className="text-xs text-muted-foreground text-center space-y-1">
          <div>Created: {new Date(setting.created_at).toLocaleDateString()}</div>
          <div>Updated: {new Date(setting.updated_at).toLocaleDateString()}</div>
          {setting.private && <div className="text-amber-600">🔒 Private</div>}
        </div>)}

      
      <AlertDialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Missing Required Fields</AlertDialogTitle>
            <AlertDialogDescription>
              Please fill out the highlighted fields. The following fields are required: Name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowValidationModal(false)}>OK</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </form>);
}
