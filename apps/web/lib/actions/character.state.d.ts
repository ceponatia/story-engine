interface StateUpdate {
    field: string;
    value: unknown;
    timestamp: string;
    context?: string;
}
export declare function updateCharacterStateFromText(adventureId: string, textUpdates: Record<string, string>, context?: string): Promise<{
    success: boolean;
    updates: Record<string, StateUpdate>;
}>;
export declare function updateCharacterState(adventureId: string, updates: Record<string, unknown>, context?: string): Promise<{
    success: boolean;
    updates: Record<string, StateUpdate>;
}>;
export declare function getCharacterState(adventureId: string): Promise<{
    success: boolean;
    character: {
        state_updates: any;
        name: string;
        personality: string;
        background: string;
        user_id: any;
        appearance: string;
        fragrances: string;
    };
}>;
export declare function buildCharacterContext(adventureId: string): Promise<string>;
export {};
//# sourceMappingURL=character.state.d.ts.map