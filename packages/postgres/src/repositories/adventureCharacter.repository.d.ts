import { AdventureCharacter } from "@story-engine/types";
import { PoolClient } from "pg";
export interface AdventureCharacterRepository {
    create(adventureId: string, originalCharacterId: string, characterData: {
        name: string;
        age?: number;
        gender?: string;
        appearance?: any;
        scents_aromas?: any;
        personality?: any;
        background?: string;
        avatar_url?: string;
    }, userId: string, client?: PoolClient): Promise<AdventureCharacter>;
    getByAdventure(adventureId: string, userId?: string): Promise<AdventureCharacter | null>;
    getState(adventureId: string, userId: string): Promise<Record<string, unknown>>;
    updateState(adventureId: string, stateUpdates: Record<string, unknown>, userId: string, client?: PoolClient): Promise<void>;
}
export declare class AdventureCharacterRepository implements AdventureCharacterRepository {
}
export declare const adventureCharacterRepository: AdventureCharacterRepository;
//# sourceMappingURL=adventureCharacter.repository.d.ts.map