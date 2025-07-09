import { CharacterFormData } from "@story-engine/types";
export declare function getCharactersAction(): Promise<Character[]>;
export declare function getCharacterAction(id: string): Promise<any>;
export declare function createCharacterAction(data: CharacterFormData): Promise<void>;
export declare function updateCharacterAction(id: string, data: CharacterFormData): Promise<any>;
export declare function deleteCharacterAction(id: string): Promise<void>;
//# sourceMappingURL=character.actions.d.ts.map