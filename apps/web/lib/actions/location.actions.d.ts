import type { LocationFormData } from "@story-engine/types";
export declare function getLocationsAction(): Promise<Location[]>;
export declare function getLocationAction(id: string): Promise<any>;
export declare function createLocationAction(data: LocationFormData): Promise<void>;
export declare function updateLocationAction(id: string, data: LocationFormData): Promise<any>;
export declare function deleteLocationAction(id: string): Promise<void>;
//# sourceMappingURL=location.actions.d.ts.map