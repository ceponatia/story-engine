"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Users, MapPin, BookOpen, ExternalLink } from "lucide-react";

// Mock data - replace with real data from database
const mockActivities = [
  {
    id: "1",
    type: "adventure",
    title: "The Enchanted Forest Quest",
    description: "Continued conversation with Elena the Mage",
    timestamp: "2 hours ago",
    href: "/adventures/1/chat",
    icon: MessageSquare,
    badge: "Active"
  },
  {
    id: "2", 
    type: "character",
    title: "Elena the Mage",
    description: "Updated character background and spells",
    timestamp: "1 day ago",
    href: "/characters/2",
    icon: Users,
    badge: "Updated"
  },
  {
    id: "3",
    type: "location",
    title: "Ancient Library of Mystra",
    description: "Created new location with detailed descriptions",
    timestamp: "3 days ago", 
    href: "/locations/3",
    icon: MapPin,
    badge: "New"
  },
  {
    id: "4",
    type: "setting",
    title: "Realm of Arcane Mysteries",
    description: "Added new world-building details",
    timestamp: "1 week ago",
    href: "/settings/4", 
    icon: BookOpen,
    badge: "Updated"
  },
];

export function RecentActivity() {
  if (mockActivities.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">No recent activity</p>
          <p className="text-xs text-muted-foreground">
            Start creating characters, locations, or adventures to see your activity here.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/adventures/new">
            Start Your First Adventure
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {mockActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted">
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <Badge variant="secondary" className="text-xs">
                    {activity.badge}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={activity.href}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="outline" asChild>
          <Link href="/library/characters">
            View All Activity
          </Link>
        </Button>
      </div>
    </div>
  );
}