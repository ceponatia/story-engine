"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, MapPin, BookOpen, Plus, Play } from "lucide-react";

const actions = [
  {
    title: "New Character",
    href: "/characters/new",
    icon: Users,
    description: "Create a character",
    variant: "default" as const,
  },
  {
    title: "New Adventure",
    href: "/adventures/new",
    icon: Plus,
    description: "Start an adventure",
    variant: "outline" as const,
  },
  {
    title: "Continue Adventure",
    href: "/adventures/continue",
    icon: Play,
    description: "Resume adventures",
    variant: "outline" as const,
  },
  {
    title: "Library",
    href: "/library/characters",
    icon: BookOpen,
    description: "Browse library",
    variant: "outline" as const,
  },
  {
    title: "New Location",
    href: "/locations/new",
    icon: MapPin,
    description: "Create a location",
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <Button
          key={action.href}
          variant={action.variant}
          className="w-full justify-start gap-3 h-auto p-3"
          asChild
        >
          <Link href={action.href}>
            <action.icon className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="font-medium">{action.title}</span>
              <span className="text-xs text-muted-foreground">{action.description}</span>
            </div>
          </Link>
        </Button>
      ))}
    </div>
  );
}
