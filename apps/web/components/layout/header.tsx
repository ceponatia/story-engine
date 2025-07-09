"use client";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navigation/navbar";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background">
      <div className="flex h-14 items-center">
        <div className="flex-1 max-w-7xl mx-auto px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/site-images/title.PNG"
              alt="StoryEngine"
              width={200}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
        </div>
        <div className="pr-4">
          <Navbar />
        </div>
      </div>
    </header>
  );
}
