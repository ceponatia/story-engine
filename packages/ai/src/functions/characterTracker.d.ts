import { StateExtractionResult } from "./state-extractor";
export interface StateUpdate {
    field: string;
    oldValue: unknown;
    newValue: unknown;
    timestamp: string;
    context: string;
    confidence: "low" | "medium" | "high";
    source: "automated_extraction";
}
export interface CharacterStateEvent {
    eventType: "state_change" | "milestone" | "relationship_update" | "location_change";
    description: string;
    timestamp: string;
    metadata: Record<string, unknown>;
}
export interface StateUpdateResult {
    success: boolean;
    updatesApplied: number;
    highConfidenceUpdates: number;
    events: CharacterStateEvent[];
    errors: string[];
}
export declare function updateCharacterFromExtractions(adventureId: string, userId: string, extractionResult: StateExtractionResult, options?: {
    minConfidence?: "low" | "medium" | "high";
    dryRun?: boolean;
    generateEvents?: boolean;
}): Promise<StateUpdateResult>;
export declare function getCharacterStateHistory(adventureId: string, userId: string, options?: {
    includeAutomated?: boolean;
    includeManual?: boolean;
    since?: Date;
}): Promise<StateUpdate[]>;
export declare function analyzeCharacterDevelopment(history: StateUpdate[]): {
    totalChanges: number;
    changesByType: Record<string, number>;
    confidenceDistribution: Record<string, number>;
    recentActivity: boolean;
    trends: string[];
};
//# sourceMappingURL=characterTracker.d.ts.map