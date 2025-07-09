import { Persona } from "@story-engine/types";
interface User {
    id: string;
    email?: string;
    name?: string;
}
type Mode = "view" | "edit" | "create";
interface UnifiedPersonaFormProps {
    mode: Mode;
    persona?: Persona | null;
    currentUser: User | null;
    onModeChange: (newMode: Mode) => void;
    onSubmittingChange?: (isSubmitting: boolean) => void;
    onPersonaUpdate?: (persona: Persona) => void;
}
export declare function UnifiedPersonaForm({ mode, persona, currentUser, onModeChange, onSubmittingChange, onPersonaUpdate, }: UnifiedPersonaFormProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=persona.form.d.ts.map