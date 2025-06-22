"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Navbar } from "./navbar";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="w-full h-12 flex items-center justify-between px-4 bg-secondary text-secondary-foreground">
      <Link href="/" className="font-bold text-lg">
        StoryEngine
      </Link>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm">
            Hello, {user.email?.split('@')[0]}!
          </span>
        )}
        <button onClick={() => setOpen((o) => !o)} aria-label="Menu">
          <Menu />
        </button>
      </div>
      {open && <Navbar close={() => setOpen(false)} />}
    </header>
  );
}
