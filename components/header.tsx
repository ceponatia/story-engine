"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Navbar } from "./navbar";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="w-full h-12 flex items-center justify-between px-4 bg-secondary text-secondary-foreground">
      <Link href="/" className="font-bold text-lg">
        StoryEngine
      </Link>
      <button onClick={() => setOpen((o) => !o)} aria-label="Menu">
        <Menu />
      </button>
      {open && <Navbar close={() => setOpen(false)} />}
    </header>
  );
}
