"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Plus, Save, X, Eye } from "lucide-react";
import { Setting } from "@story-engine/types";
import { UnifiedSettingForm } from "./unified-setting-form";

interface User {
  id: string;
  email?: string;
  name?: string;
}

type Mode = "view" | "edit" | "create";

interface UnifiedSettingManagerProps {
  mode?: Mode;
  setting?: Setting;
  currentUser?: User | null;
  onModeChange?: (mode: Mode) => void;
}

export function UnifiedSettingManager({
  mode: initialMode = "create",
  setting,
  currentUser,
  onModeChange,
}: UnifiedSettingManagerProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = !setting || currentUser?.id === setting.user_id;

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  const handleCancel = () => {
    if (mode === "edit" && setting) {
      handleModeChange("view");
    }
  };

  // Get title based on mode
  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Create New Setting";
      case "edit":
        return `Edit ${setting?.name || "Setting"}`;
      case "view":
        return setting?.name || "Setting";
      default:
        return "Setting";
    }
  };

  // Get action buttons based on mode and permissions for header
  const getHeaderActionButtons = () => {
    if (mode === "view" && canEdit) {
      return (
        <Button variant="outline" size="sm" onClick={() => handleModeChange("edit")}>
          <Edit3 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      );
    }

    if (mode === "edit") {
      return (
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isSubmitting} form="setting-form">
            <Save className="h-4 w-4 mr-1" />
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === "create" && <Plus className="h-5 w-5" />}
            {mode === "view" && <Eye className="h-5 w-5" />}
            {mode === "edit" && <Edit3 className="h-5 w-5" />}
            <CardTitle>{getTitle()}</CardTitle>
          </div>
          <div>{getHeaderActionButtons()}</div>
        </div>
      </CardHeader>

      <CardContent>
        <UnifiedSettingForm
          mode={mode}
          setting={setting}
          currentUser={currentUser || null}
          onModeChange={handleModeChange}
          showEditButton={false}
          onSubmittingChange={setIsSubmitting}
        />
      </CardContent>
    </Card>
  );
}
