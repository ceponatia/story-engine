import { type AttributeKey } from "../schema/attribute.schema";
export type TraitKey = AttributeKey;
declare const VALID_COLUMNS: readonly ["appearance", "scents_aromas", "personality", "background"];
export type ValidColumn = (typeof VALID_COLUMNS)[number];
export interface TraitInfoRequest {
    adventureCharacterId: string;
    column: ValidColumn;
    path?: string;
}
export interface TraitInfoSuccess {
    column: string;
    path?: string;
    value: unknown;
    dataType: string;
    source: "database_query";
}
export interface TraitInfoError {
    column: string;
    path?: string;
    message: string;
    code: "INVALID_CHARACTER_ID" | "INVALID_COLUMN" | "INVALID_PATH" | "PATH_NOT_FOUND" | "CHARACTER_NOT_FOUND" | "DATABASE_ERROR";
    details?: string;
}
export interface TraitInfoResponse {
    success: boolean;
    data?: TraitInfoSuccess;
    error?: TraitInfoError;
    metadata: {
        characterId: string;
        timestamp: string;
        executionTime?: number;
    };
}
export declare function get_trait_info(request: TraitInfoRequest): Promise<TraitInfoResponse>;
export declare function get_predefined_trait(adventureCharacterId: string, traitKey: TraitKey): Promise<TraitInfoResponse>;
export declare function get_multiple_traits(adventureCharacterId: string, requests: Omit<TraitInfoRequest, "adventureCharacterId">[]): Promise<TraitInfoResponse[]>;
export declare function character_exists(adventureCharacterId: string): Promise<boolean>;
export {};
//# sourceMappingURL=getTraitInfo.d.ts.map