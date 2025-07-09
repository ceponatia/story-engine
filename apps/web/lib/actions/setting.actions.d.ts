import type { SettingFormData } from "@story-engine/types";
export declare function getSettingsAction(): Promise<Setting[]>;
export declare function getSettingAction(id: string): Promise<any>;
export declare function createSettingAction(data: SettingFormData): Promise<void>;
export declare function updateSettingAction(id: string, data: SettingFormData): Promise<any>;
export declare function deleteSettingAction(id: string): Promise<void>;
//# sourceMappingURL=setting.actions.d.ts.map