"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Clock } from "lucide-react";

export function PersonaSection() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-muted">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Clock className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
          <p className="text-sm text-muted-foreground">
            Create custom player personas to enhance your storytelling adventures. 
            This feature will allow you to save character traits, preferences, 
            and backstories for a more immersive experience.
          </p>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full" 
        disabled
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Persona
      </Button>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">
          Planned Features:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Character personality profiles</li>
          <li>• Adventure preferences</li>
          <li>• Backstory templates</li>
          <li>• Role-playing guidelines</li>
        </ul>
      </div>
    </div>
  );
}