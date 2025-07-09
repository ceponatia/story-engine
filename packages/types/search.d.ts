export interface SearchContext {
    readonly query: string;
    readonly searchType: string;
    readonly filters?: Record<string, any>;
    readonly metadata?: Record<string, any>;
}
export interface SearchResult {
    readonly type: string;
    readonly content: string;
    readonly relevanceScore: number;
    readonly metadata: {
        readonly source: string;
        readonly timestamp?: string;
        readonly [key: string]: any;
    };
}
export interface SearchResponse {
    readonly results: readonly SearchResult[];
    readonly totalFound: number;
    readonly searchMetadata: {
        readonly query: string;
        readonly searchType: string;
        readonly processingTime: number;
        readonly [key: string]: any;
    };
}
export interface SearchOptions {
    readonly maxResults?: number;
    readonly threshold?: number;
    readonly includeMetadata?: boolean;
    readonly sortBy?: "relevance" | "timestamp" | "type";
    readonly sortOrder?: "asc" | "desc";
}
export interface TextMatchOptions {
    readonly caseSensitive?: boolean;
    readonly wholeWords?: boolean;
    readonly fuzzyMatch?: boolean;
    readonly minMatchThreshold?: number;
}
export interface ConversationMessage {
    readonly id: string;
    readonly content: string;
    readonly role: string;
    readonly created_at: string;
    readonly metadata?: Record<string, any>;
}
//# sourceMappingURL=search.d.ts.map