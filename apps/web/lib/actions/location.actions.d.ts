import type { LocationFormData } from "@story-engine/types";
export declare function getLocationsAction(): Promise<import("@story-engine/types").Location[]>;
export declare function getLocationAction(id: string): Promise<import("@story-engine/types").Location | null>;
export declare function createLocationAction(data: LocationFormData): Promise<void>;
export declare function updateLocationAction(id: string, data: LocationFormData): Promise<import("@story-engine/types").Location>;
export declare function deleteLocationAction(id: string): Promise<void>;
//# sourceMappingURL=location.actions.d.ts.map