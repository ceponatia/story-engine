"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Plus, Save, X, Eye } from "lucide-react";
import { UnifiedSettingForm } from "./unified-setting-form";
export function UnifiedSettingManager({ mode: initialMode = "create", setting, currentUser, onModeChange, }) {
    const [mode, setMode] = useState(initialMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const canEdit = !setting || (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) === setting.user_id;
    const handleModeChange = (newMode) => {
        setMode(newMode);
        onModeChange === null || onModeChange === void 0 ? void 0 : onModeChange(newMode);
    };
    const handleCancel = () => {
        if (mode === "edit" && setting) {
            handleModeChange("view");
        }
    };
    const getTitle = () => {
        switch (mode) {
            case "create":
                return "Create New Setting";
            case "edit":
                return `Edit ${(setting === null || setting === void 0 ? void 0 : setting.name) || "Setting"}`;
            case "view":
                return (setting === null || setting === void 0 ? void 0 : setting.name) || "Setting";
            default:
                return "Setting";
        }
    };
    const getHeaderActionButtons = () => {
        if (mode === "view" && canEdit) {
            return (<Button variant="outline" size="sm" onClick={() => handleModeChange("edit")}>
          <Edit3 className="h-4 w-4 mr-1"/>
          Edit
        </Button>);
        }
        if (mode === "edit") {
            return (<div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isSubmitting} form="setting-form">
            <Save className="h-4 w-4 mr-1"/>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-1"/>
            Cancel
          </Button>
        </div>);
        }
        return null;
    };
    return (<Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === "create" && <Plus className="h-5 w-5"/>}
            {mode === "view" && <Eye className="h-5 w-5"/>}
            {mode === "edit" && <Edit3 className="h-5 w-5"/>}
            <CardTitle>{getTitle()}</CardTitle>
          </div>
          <div>{getHeaderActionButtons()}</div>
        </div>
      </CardHeader>

      <CardContent>
        <UnifiedSettingForm mode={mode} setting={setting} currentUser={currentUser || null} onModeChange={handleModeChange} showEditButton={false} onSubmittingChange={setIsSubmitting}/>
      </CardContent>
    </Card>);
}
