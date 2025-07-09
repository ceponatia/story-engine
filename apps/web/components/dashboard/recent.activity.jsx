"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Users, MapPin, BookOpen, ExternalLink } from "lucide-react";
import { getRecentActivity } from "@/lib/actions/activity-actions";
const getIconForType = (type) => {
    switch (type) {
        case "adventure":
            return MessageSquare;
        case "character":
            return Users;
        case "location":
            return MapPin;
        case "setting":
            return BookOpen;
        case "message":
            return MessageSquare;
        default:
            return BookOpen;
    }
};
export function RecentActivity({ userId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchActivities() {
            try {
                const data = await getRecentActivity(userId);
                setActivities(data);
            }
            catch (error) {
                console.error("Failed to fetch recent activity:", error);
                setActivities([]);
            }
            finally {
                setLoading(false);
            }
        }
        fetchActivities();
    }, [userId]);
    if (loading) {
        return (<div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground animate-pulse"/>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading recent activity...</p>
      </div>);
    }
    if (activities.length === 0) {
        return (<div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground"/>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">No recent activity</p>
          <p className="text-xs text-muted-foreground">
            Start creating characters, locations, or adventures to see your activity here.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/adventures/new">Start Your First Adventure</Link>
        </Button>
      </div>);
    }
    return (<div className="space-y-4">
      <div className="grid gap-3">
        {activities.map((activity) => {
            const IconComponent = getIconForType(activity.type);
            return (<div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted">
                  <IconComponent className="h-4 w-4"/>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {activity.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={activity.href}>
                  <ExternalLink className="h-4 w-4"/>
                </Link>
              </Button>
            </div>);
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="outline" asChild>
          <Link href="/library/characters">View All Activity</Link>
        </Button>
      </div>
    </div>);
}
