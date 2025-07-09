import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// TODO: Replace with PostgreSQL authentication check
import Link from "next/link";
import { BookOpen, Users, MapPin, Sparkles, Zap, Shield, ArrowRight, Play } from "lucide-react";

export default async function Home() {
  // TODO: Replace with actual authentication check
  const loggedIn = false;

  const features = [
    {
      icon: Users,
      title: "Character Creation",
      description:
        "Build detailed characters with rich backgrounds, personalities, and relationships.",
      color: "bg-blue-500",
    },
    {
      icon: MapPin,
      title: "World Building",
      description: "Create immersive settings and locations that bring your stories to life.",
      color: "bg-green-500",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Stories",
      description: "Generate compelling narratives with our advanced AI storytelling engine.",
      color: "bg-purple-500",
    },
    {
      icon: BookOpen,
      title: "Story Library",
      description: "Organize and manage all your creative elements in one centralized library.",
      color: "bg-orange-500",
    },
    {
      icon: Zap,
      title: "Real-time Collaboration",
      description: "Work together with other writers in real-time creative sessions.",
      color: "bg-yellow-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your stories are protected with enterprise-grade security and privacy.",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center px-4 py-20 text-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Storytelling
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                StoryEngine
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The ultimate platform for creating, managing, and telling interactive stories. Build
              rich characters, immersive worlds, and compelling narratives with the power of AI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {loggedIn ? (
              <>
                <Button size="lg" asChild className="min-w-[160px]">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="min-w-[160px]">
                  <Link href="/adventures/new" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Start Adventure
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild className="min-w-[160px]">
                  <Link href="/library/characters" className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Powerful Features for Storytellers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, organize, and share your stories in one integrated
              platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 border-0 bg-background/60 backdrop-blur"
              >
                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Ready to Start Your Story?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of writers who are already creating amazing stories with StoryEngine.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/library/characters" className="flex items-center gap-2">
                Start Free Today
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            {loggedIn && (
              <Button size="lg" asChild>
                <Link href="/library/characters" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Browse Your Library
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
