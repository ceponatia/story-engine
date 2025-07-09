"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@story-engine/auth";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, } from "@/components/ui/navigation-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { BookOpen, Users, MapPin, Sparkles, User, Menu, Play, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
const libraryItems = [
    {
        title: "Characters",
        href: "/library/characters",
        description: "Manage your story characters and their details",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/library/settings",
        description: "Create and organize story settings and worlds",
        icon: MapPin,
    },
    {
        title: "Locations",
        href: "/library/locations",
        description: "Build immersive locations for your stories",
        icon: BookOpen,
    },
    {
        title: "Adventure Types",
        href: "/adventure-types",
        description: "Create custom adventure templates and prompts",
        icon: Settings,
    },
];
const adventureItems = [
    {
        title: "New Adventure",
        href: "/adventures/new",
        description: "Start a brand new storytelling adventure",
        icon: Plus,
    },
    {
        title: "Continue Adventure",
        href: "/adventures/continue",
        description: "Resume your ongoing adventures",
        icon: Play,
    },
];
const navigationItems = [
    { title: "Home", href: "/" },
    { title: "Dashboard", href: "/dashboard" },
];
export function Navbar({ className }) {
    var _a;
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const user = session === null || session === void 0 ? void 0 : session.user;
    const isActive = (href) => pathname === href;
    return (<div className={cn("flex items-center space-x-4", className)}>
      
      <div className="hidden md:flex">
        <NavigationMenu>
          <NavigationMenuList>
            {navigationItems.map((item) => (<NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <Link href={item.href} className={cn(navigationMenuTriggerStyle(), isActive(item.href) && "bg-accent text-accent-foreground")}>
                    {item.title}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>))}

            
            <NavigationMenuItem>
              <NavigationMenuTrigger className={cn(pathname.startsWith("/adventures") && "bg-accent text-accent-foreground")}>
                Adventures
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md" href="/adventures">
                        <Sparkles className="h-6 w-6"/>
                        <div className="mb-2 mt-4 text-lg font-medium">Adventures</div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Create and continue your storytelling adventures
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  {adventureItems.map((item) => (<li key={item.href}>
                      <NavigationMenuLink asChild>
                        <Link href={item.href} className={cn("block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground", isActive(item.href) && "bg-accent text-accent-foreground")}>
                          <div className="flex items-center space-x-2">
                            <item.icon className="h-4 w-4"/>
                            <div className="text-sm font-medium leading-none">{item.title}</div>
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            
            <NavigationMenuItem>
              <NavigationMenuTrigger className={cn(pathname.startsWith("/library") && "bg-accent text-accent-foreground")}>
                Library
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md" href="/library">
                        <Sparkles className="h-6 w-6"/>
                        <div className="mb-2 mt-4 text-lg font-medium">Story Library</div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Manage all your story elements in one place
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  {libraryItems.map((item) => (<li key={item.href}>
                      <NavigationMenuLink asChild>
                        <Link href={item.href} className={cn("block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground", isActive(item.href) && "bg-accent text-accent-foreground")}>
                          <div className="flex items-center space-x-2">
                            <item.icon className="h-4 w-4"/>
                            <div className="text-sm font-medium leading-none">{item.title}</div>
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/docs" className={cn(navigationMenuTriggerStyle(), isActive("/docs") && "bg-accent text-accent-foreground")}>
                  Documentation
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/about" className={cn(navigationMenuTriggerStyle(), isActive("/about") && "bg-accent text-accent-foreground")}>
                  About
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      
      <div className="md:hidden">
        <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5"/>
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            {navigationItems.map((item) => (<DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className={cn("w-full", isActive(item.href) && "bg-accent text-accent-foreground")} onClick={() => setIsMobileMenuOpen(false)}>
                  {item.title}
                </Link>
              </DropdownMenuItem>))}
            <DropdownMenuSeparator />
            {libraryItems.map((item) => (<DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className={cn("w-full", isActive(item.href) && "bg-accent text-accent-foreground")} onClick={() => setIsMobileMenuOpen(false)}>
                  <item.icon className="mr-2 h-4 w-4"/>
                  {item.title}
                </Link>
              </DropdownMenuItem>))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/docs" onClick={() => setIsMobileMenuOpen(false)}>
                Documentation
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      
      <div>
        {user ? (<DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <User className="h-4 w-4"/>
                <span className="hidden sm:inline">{(_a = user.email) === null || _a === void 0 ? void 0 : _a.split("@")[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => {
                await signOut();
                window.location.href = "/";
            }}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>) : (<div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Register</Link>
            </Button>
          </div>)}
      </div>
    </div>);
}
