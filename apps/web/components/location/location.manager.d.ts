import { Location } from "@story-engine/types";
interface UnifiedLocationManagerProps {
    mode?: "create" | "view" | "edit";
    location?: Location;
    currentUser?: {
        id: string;
        email?: string;
        name?: string;
    } | null;
    onModeChange?: (mode: "create" | "view" | "edit") => void;
    onLocationUpdate?: (location: Location) => void;
}
export declare function UnifiedLocationManager({ mode: initialMode, location, currentUser, onModeChange, onLocationUpdate, }: UnifiedLocationManagerProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=location.manager.d.ts.map