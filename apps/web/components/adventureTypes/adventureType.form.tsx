"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createAdventureType, updateAdventureType } from "@/lib/actions/user-adventure-types";
import type { UserAdventureType } from "@/lib/postgres/types";

interface AdventureTypeFormProps {
  adventureType?: UserAdventureType;
  isEditing?: boolean;
}

const DEFAULT_TEMPLATE = `You are {{character.name}}, {{character.description}}.

CHARACTER: Age {{character.age}}, {{character.gender}}
PERSONALITY: {{character.personality}}
BACKGROUND: {{character.background}}
APPEARANCE: {{character.appearance}}
TRAITS: {{character.scents_aromas}}

{{#if setting}}
WORLD: {{setting.name}} - {{setting.description}} ({{setting.world_type}})
{{/if}}

{{#if location}}
LOCATION: {{location.name}} - {{location.description}}
{{/if}}

CORE RULES:
1. NEVER write for {{userName}} - only respond as {{character.name}}
2. Keep responses to 1-2 paragraphs maximum
3. Use *asterisks* for thoughts/actions, "quotes" for dialogue
4. Wait for {{userName}}'s response before continuing

RESPONSE FORMAT:
"{{character.name}}'s dialogue here."
*{{character.name}}'s thoughts and actions here.*

Current scenario: {{adventureTitle}}`;

export function AdventureTypeForm({ adventureType, isEditing = false }: AdventureTypeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: adventureType?.name || "",
    description: adventureType?.description || "",
    is_public: adventureType?.is_public || false,
    template_content: adventureType?.template_content || DEFAULT_TEMPLATE,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      if (isEditing && adventureType) {
        data.append("id", adventureType.id);
      }
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("is_public", formData.is_public.toString());
      data.append("template_content", formData.template_content);

      if (isEditing) {
        await updateAdventureType(data);
      } else {
        await createAdventureType(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleTemplateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, template_content: value }));
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById("template_content") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.template_content;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      setFormData((prev) => ({ ...prev, template_content: newText }));

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
  };

  const placeholders = [
    "{{character.name}}",
    "{{character.age}}",
    "{{character.gender}}",
    "{{character.personality}}",
    "{{character.background}}",
    "{{character.appearance}}",
    "{{character.scents_aromas}}",
    "{{userName}}",
    "{{adventureTitle}}",
    "{{#if setting}}...{{/if}}",
    "{{#if location}}...{{/if}}",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Define the basic properties of your adventure type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., fantasy, mystery, horror"
              required
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Use lowercase letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what makes this adventure type unique..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_public: !!checked }))
              }
              disabled={loading}
            />
            <Label htmlFor="is_public" className="text-sm font-normal">
              Make this adventure type public (others can use it)
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template Content</CardTitle>
          <CardDescription>
            Design the system prompt template that will guide the AI&apos;s behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor" className="w-full">
            <TabsList>
              <TabsTrigger value="editor">Template Editor</TabsTrigger>
              <TabsTrigger value="help">Help & Placeholders</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div>
                <Label htmlFor="template_content">Template Content</Label>
                <Textarea
                  id="template_content"
                  value={formData.template_content}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  placeholder="Enter your template content..."
                  rows={20}
                  className="font-mono text-sm"
                  required
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use Handlebars syntax (e.g., {"{{character.name}}"}) for dynamic content
                </p>
              </div>
            </TabsContent>

            <TabsContent value="help" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Available Placeholders</h4>
                <div className="grid grid-cols-2 gap-2">
                  {placeholders.map((placeholder) => (
                    <Button
                      key={placeholder}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertPlaceholder(placeholder)}
                      className="justify-start font-mono text-xs"
                    >
                      {placeholder}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Template Guidelines</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Always include {"{{character.name}}"} - it&apos;s required</li>
                  <li>
                    • Use conditional blocks like {"{{#if setting}}...{{/if}}"} for optional content
                  </li>
                  <li>• Set clear rules for AI behavior (what to do/not do)</li>
                  <li>• Define response format expectations</li>
                  <li>• Keep prompts focused and not too verbose</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEditing ? "Update Adventure Type" : "Create Adventure Type"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
