import { Button } from "@/components/ui/button";

export function DeployButton() {
  return (
    <>
      <Button className="flex items-center gap-2" size="sm" disabled>
        <svg
          className="h-3 w-3"
          viewBox="0 0 76 65"
          fill="hsl(var(--background)/1)"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="inherit" />
        </svg>
        <span>Deploy (Coming Soon)</span>
      </Button>
    </>
  );
}
