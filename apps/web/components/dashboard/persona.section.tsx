"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Edit, Trash2 } from "lucide-react";
import { Persona } from "@story-engine/types";
import { getPersonasAction } from "@/lib/actions/persona-actions";
import { UnifiedPersonaManager } from "@/components/personas/unified-persona-manager";

interface User {
  id: string;
  email?: string;
  name?: string;
}

interface PersonaSectionProps {
  user?: User;
}

export function PersonaSection({ user }: PersonaSectionProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [mode, setMode] = useState<"list" | "create" | "view">("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPersonas();
    }
  }, [user]);

  const loadPersonas = async () => {
    try {
      const userPersonas = await getPersonasAction();
      setPersonas(userPersonas);
    } catch (error: any) {
      console.error("Error loading personas:", error);
      // If personas table doesn't exist, show empty state instead of error
      setPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaUpdate = (updatedPersona: Persona) => {
    setPersonas((prev) => {
      const index = prev.findIndex((p) => p.id === updatedPersona.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = updatedPersona;
        return updated;
      } else {
        return [...prev, updatedPersona];
      }
    });
    setSelectedPersona(updatedPersona);
    setMode("view");
  };

  const handlePersonaDelete = () => {
    if (selectedPersona) {
      setPersonas((prev) => prev.filter((p) => p.id !== selectedPersona.id));
      setSelectedPersona(null);
      setMode("list");
    }
  };

  if (!user) {
    return (
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-muted">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Please log in to manage your personas.</p>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create New Persona</h3>
          <Button variant="outline" size="sm" onClick={() => setMode("list")}>
            Back to List
          </Button>
        </div>
        <UnifiedPersonaManager
          persona={null}
          currentUser={user}
          initialMode="create"
          onPersonaUpdate={handlePersonaUpdate}
        />
      </div>
    );
  }

  if (mode === "view" && selectedPersona) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setMode("list")}>
            Back to List
          </Button>
        </div>
        <UnifiedPersonaManager
          persona={selectedPersona}
          currentUser={user}
          initialMode="view"
          onPersonaUpdate={handlePersonaUpdate}
          onPersonaDelete={handlePersonaDelete}
        />
      </div>
    );
  }

  // List mode
  if (loading) {
    return (
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-muted">
            <Sparkles className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading personas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {personas.length === 0 ? (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-muted">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Create a persona to help with pronoun disambiguation in adventures. This allows the AI
              to better understand when you're referring to yourself vs. characters.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Your Personas</h3>
          {personas.map((persona) => (
            <div
              key={persona.id}
              className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium">{persona.name}</div>
                <div className="text-sm text-muted-foreground">
                  {persona.age} years old • {persona.gender}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPersona(persona);
                    setMode("view");
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={() => setMode("create")}>
        <Plus className="h-4 w-4 mr-2" />
        Create Persona
      </Button>

      {personas.length === 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Benefits of Personas:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Improved pronoun clarity (I, you, he, she)</li>
            <li>• Better character vs. player distinction</li>
            <li>• Enhanced adventure immersion</li>
            <li>• Consistent character interactions</li>
          </ul>
        </div>
      )}
    </div>
  );
}
