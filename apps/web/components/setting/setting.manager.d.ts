import { Setting } from "@story-engine/types";
interface User {
    id: string;
    email?: string;
    name?: string;
}
type Mode = "view" | "edit" | "create";
interface UnifiedSettingManagerProps {
    mode?: Mode;
    setting?: Setting;
    currentUser?: User | null;
    onModeChange?: (mode: Mode) => void;
}
export declare function UnifiedSettingManager({ mode: initialMode, setting, currentUser, onModeChange, }: UnifiedSettingManagerProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=setting.manager.d.ts.map