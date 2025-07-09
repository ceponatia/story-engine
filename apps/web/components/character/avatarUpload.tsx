"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  onUpload: (url: string) => void;
  className?: string;
}

export function AvatarUpload({ onUpload, className }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/avatar", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const result = await response.json();
        onUpload(result.url);
      } catch (error) {
        console.error("Upload error:", error);
        const message = error instanceof Error ? error.message : "Upload failed. Please try again.";
        alert(message);
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    disabled: uploading,
  });

  return (
    <div className={cn("flex-1 min-h-32 flex flex-col justify-center", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          isDragActive || dragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          uploading && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />

        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-gray-400" />

          {uploading ? (
            <p className="text-sm text-gray-600">Uploading...</p>
          ) : isDragActive ? (
            <p className="text-sm text-primary font-medium">Drop the image here</p>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop an image here, or click to select
              </p>
              <Button type="button" size="sm" disabled={uploading} className="pointer-events-none">
                Upload Image
              </Button>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">Accepts JPEG, PNG, WebP up to 5MB</p>
    </div>
  );
}
