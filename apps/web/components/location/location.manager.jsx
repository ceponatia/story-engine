"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Edit3, Plus, Save, X, Eye, Tag } from "lucide-react";
import { createLocationAction, updateLocationAction } from "@/lib/actions/location-actions";
const locationFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    notable_features: z.string().optional(),
    connected_locations: z.string().optional(),
    tags: z.string().optional(),
});
export function UnifiedLocationManager({ mode: initialMode = "create", location, currentUser, onModeChange, onLocationUpdate, }) {
    const [mode, setMode] = useState(initialMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const canEdit = !location || (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) === location.user_id;
    const form = useForm({
        resolver: zodResolver(locationFormSchema),
        defaultValues: {
            name: (location === null || location === void 0 ? void 0 : location.name) || "",
            description: (location === null || location === void 0 ? void 0 : location.description) || "",
            notable_features: Array.isArray(location === null || location === void 0 ? void 0 : location.notable_features)
                ? location.notable_features.join(", ")
                : "",
            connected_locations: Array.isArray(location === null || location === void 0 ? void 0 : location.connected_locations)
                ? location.connected_locations.join(", ")
                : "",
            tags: Array.isArray(location === null || location === void 0 ? void 0 : location.tags) ? location.tags.join(", ") : "",
        },
    });
    const getFormDataFromLocation = useCallback((loc) => ({
        name: loc.name,
        description: loc.description,
        notable_features: Array.isArray(loc.notable_features) ? loc.notable_features.join(", ") : "",
        connected_locations: Array.isArray(loc.connected_locations)
            ? loc.connected_locations.join(", ")
            : "",
        tags: Array.isArray(loc.tags) ? loc.tags.join(", ") : "",
    }), []);
    useEffect(() => {
        if (location) {
            form.reset(getFormDataFromLocation(location));
        }
    }, [location, form, getFormDataFromLocation]);
    const handleModeChange = useCallback((newMode) => {
        setMode(newMode);
        setError(null);
        onModeChange === null || onModeChange === void 0 ? void 0 : onModeChange(newMode);
    }, [onModeChange]);
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError(null);
        try {
            if (mode === "create") {
                await createLocationAction(data);
                handleModeChange("view");
            }
            else if (mode === "edit" && location) {
                await updateLocationAction(location.id, data);
                handleModeChange("view");
            }
        }
        catch (error) {
            console.error("Error saving location:", error);
            setError(error instanceof Error ? error.message : "Failed to save location. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleCancel = useCallback(() => {
        form.reset();
        setError(null);
        if (location) {
            handleModeChange("view");
        }
    }, [form, location, handleModeChange]);
    const renderFormFields = () => (<>
      <FormField control={form.control} name="name" render={({ field }) => (<FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter location name..." {...field}/>
            </FormControl>
            <FormMessage />
          </FormItem>)}/>

      <FormField control={form.control} name="description" render={({ field }) => (<FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe this location..." className="min-h-[100px]" {...field}/>
            </FormControl>
            <FormMessage />
          </FormItem>)}/>

      <FormField control={form.control} name="tags" render={({ field }) => (<FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <Input placeholder="tag1, tag2, tag3..." {...field}/>
            </FormControl>
            <FormMessage />
          </FormItem>)}/>

      <FormField control={form.control} name="notable_features" render={({ field }) => (<FormItem>
            <FormLabel>Notable Features</FormLabel>
            <FormControl>
              <Textarea placeholder="List notable features (comma-separated)..." className="min-h-[80px]" {...field}/>
            </FormControl>
            <FormMessage />
          </FormItem>)}/>

      <FormField control={form.control} name="connected_locations" render={({ field }) => (<FormItem>
            <FormLabel>Connected Locations</FormLabel>
            <FormControl>
              <Input placeholder="location1, location2, location3..." {...field}/>
            </FormControl>
            <FormMessage />
          </FormItem>)}/>
    </>);
    const renderViewMode = () => {
        if (!location)
            return null;
        return (<div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{location.name}</h3>
          <p className="text-muted-foreground">{location.description}</p>
        </div>

        {location.notable_features && location.notable_features.length > 0 && (<div>
            <h4 className="font-medium mb-2">Notable Features</h4>
            <div className="flex flex-wrap gap-2">
              {location.notable_features.map((feature, index) => (<Badge key={index} variant="secondary">
                  {feature}
                </Badge>))}
            </div>
          </div>)}

        {location.connected_locations && location.connected_locations.length > 0 && (<div>
            <h4 className="font-medium mb-2">Connected Locations</h4>
            <div className="flex flex-wrap gap-2">
              {location.connected_locations.map((connectedLocation, index) => (<Badge key={index} variant="outline">
                  {connectedLocation}
                </Badge>))}
            </div>
          </div>)}

        {location.tags && location.tags.length > 0 && (<div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-muted-foreground"/>
              <h4 className="font-medium">Tags</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {location.tags.map((tag, index) => (<Badge key={index} variant="default">
                  {tag}
                </Badge>))}
            </div>
          </div>)}
      </div>);
    };
    const getTitle = useCallback(() => {
        switch (mode) {
            case "create":
                return "Create New Location";
            case "edit":
                return `Edit ${(location === null || location === void 0 ? void 0 : location.name) || "Location"}`;
            case "view":
                return (location === null || location === void 0 ? void 0 : location.name) || "Location";
            default:
                return "Location";
        }
    }, [mode, location === null || location === void 0 ? void 0 : location.name]);
    const getActionButtons = useCallback(() => {
        if (mode === "view" && canEdit) {
            return (<Button variant="outline" size="sm" onClick={() => handleModeChange("edit")}>
          <Edit3 className="h-4 w-4 mr-1"/>
          Edit
        </Button>);
        }
        if (mode === "create" || mode === "edit") {
            return (<div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isSubmitting} form="location-form">
            <Save className="h-4 w-4 mr-1"/>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
          {mode === "edit" && location && (<Button variant="outline" size="sm" onClick={handleCancel} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-1"/>
              Cancel
            </Button>)}
        </div>);
        }
        return null;
    }, [mode, canEdit, isSubmitting, location, handleModeChange, handleCancel]);
    return (<Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === "create" && <Plus className="h-5 w-5"/>}
            {mode === "view" && <Eye className="h-5 w-5"/>}
            {mode === "edit" && <Edit3 className="h-5 w-5"/>}
            <CardTitle>{getTitle()}</CardTitle>
          </div>
          <div>{getActionButtons()}</div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (<div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>)}

        {mode === "view" ? (renderViewMode()) : (<Form {...form}>
            <form id="location-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {renderFormFields()}
            </form>
          </Form>)}
      </CardContent>
    </Card>);
}
