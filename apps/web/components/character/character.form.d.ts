import type { Character } from "@story-engine/types";
interface User {
    id: string;
    email?: string;
    name?: string;
}
type Mode = "view" | "edit" | "create";
interface UnifiedCharacterFormProps {
    mode: Mode;
    character?: Character | null;
    currentUser: User | null;
    onModeChange: (newMode: Mode) => void;
    showEditButton?: boolean;
    onSubmittingChange?: (isSubmitting: boolean) => void;
}
export declare function UnifiedCharacterForm({ mode, character, currentUser, onModeChange, showEditButton, onSubmittingChange, }: UnifiedCharacterFormProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=character.form.d.ts.map