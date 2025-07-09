import { Setting } from "@story-engine/types";
interface User {
    id: string;
    email?: string;
    name?: string;
}
type Mode = "view" | "edit" | "create";
interface UnifiedSettingFormProps {
    mode: Mode;
    setting?: Setting | null;
    currentUser: User | null;
    onModeChange: (newMode: Mode) => void;
    showEditButton?: boolean;
    onSubmittingChange?: (isSubmitting: boolean) => void;
}
export declare function UnifiedSettingForm({ mode, setting, currentUser, onModeChange, showEditButton, onSubmittingChange, }: UnifiedSettingFormProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=setting.form.d.ts.map