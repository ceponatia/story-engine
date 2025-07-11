import type { SettingFormData } from "@story-engine/types";
export declare function getSettingsAction(): Promise<import("@story-engine/types").Setting[]>;
export declare function getSettingAction(id: string): Promise<import("@story-engine/types").Setting | null>;
export declare function createSettingAction(data: SettingFormData): Promise<void>;
export declare function updateSettingAction(id: string, data: SettingFormData): Promise<import("@story-engine/types").Setting>;
export declare function deleteSettingAction(id: string): Promise<void>;
//# sourceMappingURL=setting.actions.d.ts.map