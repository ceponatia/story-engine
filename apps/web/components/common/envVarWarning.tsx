import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function EnvVarWarning() {
  return (
    <div className="flex gap-4 items-center">
      <Badge variant={"outline"} className="font-normal">
        Database migration in progress
      </Badge>
      <div className="flex gap-2">
        <Button size="sm" variant={"outline"} disabled>
          Sign in (Coming Soon)
        </Button>
        <Button size="sm" variant={"default"} disabled>
          Sign up (Coming Soon)
        </Button>
      </div>
    </div>
  );
}
