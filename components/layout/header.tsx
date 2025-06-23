"use client";
import Link from "next/link";
import { EnhancedNavbar } from "@/components/navigation/enhanced-navbar";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center">
        <div className="flex-1 max-w-7xl mx-auto px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">StoryEngine</span>
          </Link>
        </div>
        <div className="pr-4">
          <EnhancedNavbar />
        </div>
      </div>
    </header>
  );
}
