"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/auth-js";

interface Props {
  close: () => void;
}

export function Navbar({ close }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [showLib, setShowLib] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [close]);

  return (
    <div
      ref={ref}
      className="absolute right-2 top-12 z-50 flex w-48 flex-col gap-2 rounded-md bg-secondary p-4 text-secondary-foreground shadow"
    >
      <Link href="/" onClick={close} className="hover:underline">
        Home
      </Link>
      <Link href="/new-adventure" onClick={close} className="hover:underline">
        New Adventure
      </Link>
      <Link href="/continue" onClick={close} className="hover:underline">
        Continue Adventure
      </Link>
      <button
        onClick={() => setShowLib((s) => !s)}
        className="text-left hover:underline"
      >
        Library
      </button>
      {showLib && (
        <div className="ml-4 flex flex-col gap-1">
          <Link href="/library/characters" onClick={close} className="hover:underline">
            Characters
          </Link>
          <Link href="/library/settings" onClick={close} className="hover:underline">
            Settings
          </Link>
          <Link href="/library/locations" onClick={close} className="hover:underline">
            Locations
          </Link>
        </div>
      )}
      <Link href="/docs" onClick={close} className="hover:underline">
        Documentation
      </Link>
      <Link href="/about" onClick={close} className="hover:underline">
        About
      </Link>
      <hr className="my-1" />
      {user ? (
        <>
          <Link href="/dashboard" onClick={close} className="hover:underline">
            Dashboard
          </Link>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              close();
            }}
          >
            Sign Out
          </Button>
        </>
      ) : (
        <>
          <Link href="/auth/login" onClick={close} className="hover:underline">
            Login
          </Link>
          <Link href="/auth/sign-up" onClick={close} className="hover:underline">
            Register
          </Link>
        </>
      )}
    </div>
  );
}
