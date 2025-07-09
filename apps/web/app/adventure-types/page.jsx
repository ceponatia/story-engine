import { requireAuth } from "@/lib/auth-helper";
import { getUserAdventureTypes, getPublicAdventureTypes } from "@/lib/postgres/repositories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Lock, Globe, User } from "lucide-react";
export default async function AdventureTypesPage() {
    const { user } = await requireAuth();
    const [userTypes, publicTypes] = await Promise.all([
        getUserAdventureTypes(user.id),
        getPublicAdventureTypes(10),
    ]);
    return (<div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Adventure Types</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage custom adventure types with unique prompts and settings
          </p>
        </div>
        <Button asChild>
          <Link href="/adventure-types/new">
            <Plus className="h-4 w-4 mr-2"/>
            Create Adventure Type
          </Link>
        </Button>
      </div>

      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <User className="h-5 w-5 mr-2"/>
          Your Adventure Types
        </h2>

        {userTypes.length === 0 ? (<Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t created any adventure types yet.
              </p>
              <Button asChild>
                <Link href="/adventure-types/new">Create Your First Adventure Type</Link>
              </Button>
            </CardContent>
          </Card>) : (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userTypes.map((type) => (<Card key={type.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg capitalize">
                      {type.name.replace(/_/g, " ")}
                    </CardTitle>
                    {type.is_public ? (<Badge variant="secondary">
                        <Globe className="h-3 w-3 mr-1"/>
                        Public
                      </Badge>) : (<Badge variant="outline">
                        <Lock className="h-3 w-3 mr-1"/>
                        Private
                      </Badge>)}
                  </div>
                  {type.description && <CardDescription>{type.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Created {new Date(type.created_at).toLocaleDateString()}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/adventure-types/${type.id}`}>View/Edit</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>))}
          </div>)}
      </section>

      
      {publicTypes.length > 0 && (<section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2"/>
            Public Adventure Types
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publicTypes.map((type) => (<Card key={type.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg capitalize">
                    {type.name.replace(/_/g, " ")}
                  </CardTitle>
                  {type.description && <CardDescription>{type.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">By community user</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/adventure-types/${type.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>))}
          </div>
        </section>)}
    </div>);
}
