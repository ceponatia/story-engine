import { Adventure, Persona } from "@story-engine/types";
import { PoolClient } from "pg";
export interface AdventureRepository {
    getByUser(userId: string): Promise<(Adventure & {
        character_name?: string;
        location_name?: string;
    })[]>;
    getById(id: string, userId: string): Promise<(Adventure & {
        adventure_characters: Array<{
            name: string;
        }>;
    }) | null>;
    getWithPersona(adventureId: string, userId: string): Promise<(Adventure & {
        persona?: Persona;
    }) | null>;
    create(title: string, characterId: string, locationId: string | null, settingId: string | null, userId: string, userName?: string, adventureType?: string, personaId?: string | null, client?: PoolClient): Promise<Adventure>;
    updateSystemPrompt(adventureId: string, systemPrompt: string, client?: PoolClient): Promise<void>;
}
export declare class AdventureRepository implements AdventureRepository {
}
export declare const adventureRepository: AdventureRepository;
//# sourceMappingURL=adventure.repository.d.ts.map