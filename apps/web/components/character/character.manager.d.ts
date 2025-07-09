import { Character } from "@story-engine/types";
interface User {
    id: string;
    email?: string;
    name?: string;
}
type Mode = "view" | "edit" | "create";
interface UnifiedCharacterManagerProps {
    character: Character | null;
    currentUser: User | null;
    initialMode: Mode;
}
export declare function UnifiedCharacterManager({ character, currentUser, initialMode, }: UnifiedCharacterManagerProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=character.manager.d.ts.map