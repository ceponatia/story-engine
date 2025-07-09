import { Persona } from "@story-engine/types";
interface User {
    id: string;
    email?: string;
    name?: string;
}
type Mode = "view" | "edit" | "create";
interface UnifiedPersonaManagerProps {
    persona: Persona | null;
    currentUser: User | null;
    initialMode: Mode;
    onPersonaUpdate?: (persona: Persona) => void;
    onPersonaDelete?: () => void;
}
export declare function UnifiedPersonaManager({ persona, currentUser, initialMode, onPersonaUpdate, onPersonaDelete, }: UnifiedPersonaManagerProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=persona.manager.d.ts.map