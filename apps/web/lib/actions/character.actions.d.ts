import { CharacterFormData } from "@story-engine/types";
export declare function getCharactersAction(): Promise<import("@story-engine/types").Character[]>;
export declare function getCharacterAction(id: string): Promise<import("@story-engine/types").Character | null>;
export declare function createCharacterAction(data: CharacterFormData): Promise<void>;
export declare function updateCharacterAction(id: string, data: CharacterFormData): Promise<import("@story-engine/types").Character>;
export declare function deleteCharacterAction(id: string): Promise<void>;
//# sourceMappingURL=character.actions.d.ts.map