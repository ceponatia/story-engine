"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSection } from "@/components/dashboard/profile-section";
import { PersonaSection } from "@/components/dashboard/persona-section";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { User, Settings, Sparkles, BookOpen } from "lucide-react";

interface DashboardContentProps {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
}

export function DashboardContent({ user }: DashboardContentProps) {
  const userName = user.name || user.email?.split('@')[0] || 'User';

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Manage your profile, personas, and continue your storytelling adventures.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Management */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Management
            </CardTitle>
            <CardDescription>
              Update your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileSection user={user} />
          </CardContent>
        </Card>

        {/* Persona Management - Placeholder */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Persona Management
            </CardTitle>
            <CardDescription>
              Create and manage player personas for adventures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PersonaSection />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Jump into your favorite StoryEngine features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest adventures and library updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}