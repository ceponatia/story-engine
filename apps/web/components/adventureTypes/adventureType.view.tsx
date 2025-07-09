"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Globe, Lock, Trash2, Edit } from "lucide-react";
import { deleteAdventureType } from "@/lib/actions/user-adventure-types";
import Link from "next/link";
import type { UserAdventureType } from "@/lib/postgres/types";

interface AdventureTypeViewProps {
  adventureType: UserAdventureType;
}

export function AdventureTypeView({ adventureType }: AdventureTypeViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("id", adventureType.id);
      await deleteAdventureType(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete adventure type");
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const isOwner = true; // This should be determined by comparing with current user

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl capitalize">
                {adventureType.name.replace(/_/g, " ")}
              </CardTitle>
              {adventureType.description && (
                <CardDescription className="mt-2">{adventureType.description}</CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {adventureType.is_public ? (
                <Badge variant="secondary">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
              {isOwner && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/adventure-types/${adventureType.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(adventureType.created_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {new Date(adventureType.updated_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template & Configuration</CardTitle>
          <CardDescription>View the template content and AI behavior settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="template" className="w-full">
            <TabsList>
              <TabsTrigger value="template">Template Content</TabsTrigger>
              <TabsTrigger value="config">Validation Config</TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Template Content</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(adventureType.template_content)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={adventureType.template_content}
                  readOnly
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <div>
                <Label>Validation Configuration</Label>
                <Textarea
                  value={JSON.stringify(adventureType.validation_config, null, 2)}
                  readOnly
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Adventure Type</CardTitle>
            <CardDescription>
              This action cannot be undone. This will permanently delete the adventure type &quot;
              {adventureType.name}&quot; and remove it from all your adventures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete Permanently"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
