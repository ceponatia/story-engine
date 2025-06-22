import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  const loggedIn = !!data.session;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 text-center">
      <h1 className="text-4xl font-bold">Welcome to StoryEngine</h1>
      <div className="flex gap-4">
        {loggedIn ? (
          <>
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/protected">Start Adventure</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/auth/sign-up">Register</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
