"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { createPersonaAction, updatePersonaAction } from "@/lib/actions/persona-actions";
import { Save } from "lucide-react";
export function UnifiedPersonaForm({ mode, persona, currentUser, onModeChange, onSubmittingChange, onPersonaUpdate, }) {
    var _a, _b, _c, _d;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const canEdit = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) === (persona === null || persona === void 0 ? void 0 : persona.created_by);
    const isFormMode = mode === "edit" || mode === "create";
    const [formData, setFormData] = useState({
        name: (_a = persona === null || persona === void 0 ? void 0 : persona.name) !== null && _a !== void 0 ? _a : "",
        age: (_c = (_b = persona === null || persona === void 0 ? void 0 : persona.age) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : "",
        gender: (_d = persona === null || persona === void 0 ? void 0 : persona.gender) !== null && _d !== void 0 ? _d : "Other",
    });
    useEffect(() => {
        var _a, _b, _c, _d;
        if (persona) {
            setFormData({
                name: (_a = persona.name) !== null && _a !== void 0 ? _a : "",
                age: (_c = (_b = persona.age) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : "",
                gender: (_d = persona.gender) !== null && _d !== void 0 ? _d : "Other",
            });
        }
    }, [persona]);
    useEffect(() => {
        onSubmittingChange === null || onSubmittingChange === void 0 ? void 0 : onSubmittingChange(isSubmitting);
    }, [isSubmitting, onSubmittingChange]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser)
            return;
        setIsSubmitting(true);
        try {
            const personaData = {
                name: formData.name.trim(),
                age: parseInt(formData.age) || 0,
                gender: formData.gender,
            };
            if (mode === "create") {
                const newPersona = await createPersonaAction(personaData);
                onPersonaUpdate === null || onPersonaUpdate === void 0 ? void 0 : onPersonaUpdate(newPersona);
                onModeChange("view");
            }
            else if (mode === "edit" && persona) {
                const updatedPersona = await updatePersonaAction(persona.id, personaData);
                onPersonaUpdate === null || onPersonaUpdate === void 0 ? void 0 : onPersonaUpdate(updatedPersona);
                onModeChange("view");
            }
        }
        catch (error) {
            console.error("Error saving persona:", error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleInputChange = (field, value) => {
        setFormData((prev) => (Object.assign(Object.assign({}, prev), { [field]: value })));
    };
    if (!isFormMode) {
        return (<div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Name</Label>
            <div className="text-sm text-muted-foreground">{(persona === null || persona === void 0 ? void 0 : persona.name) || "N/A"}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">Age</Label>
            <div className="text-sm text-muted-foreground">{(persona === null || persona === void 0 ? void 0 : persona.age) || "N/A"}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">Gender</Label>
            <div className="text-sm text-muted-foreground">{(persona === null || persona === void 0 ? void 0 : persona.gender) || "N/A"}</div>
          </div>
        </div>
      </div>);
    }
    return (<form id="persona-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Enter your name" required disabled={isSubmitting}/>
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input id="age" type="number" min="1" max="150" value={formData.age} onChange={(e) => handleInputChange("age", e.target.value)} placeholder="Enter your age" required disabled={isSubmitting}/>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Non-binary">Non-binary</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {mode === "create" && (<div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4"/>
            {isSubmitting ? "Creating..." : "Create Persona"}
          </Button>
        </div>)}
    </form>);
}
