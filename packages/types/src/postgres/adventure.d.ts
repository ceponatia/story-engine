export interface Adventure {
    id: string;
    title: string;
    user_id: string;
    character_id: string;
    location_id: string | null;
    setting_id: string | null;
    created_at: Date;
    updated_at: Date;
    status: "active" | "completed" | "archived";
    current_state?: Record<string, any>;
    conversation_summary?: string;
}
export interface AdventureCharacter {
    id: string;
    adventure_id: string;
    character_id: string;
    name: string;
    current_state: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}
export interface AdventureMessage {
    id: string;
    adventure_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    character_id?: string;
    created_at: Date;
    metadata?: Record<string, any>;
}
export interface Persona {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    avatar_url?: string;
    created_at: Date;
    updated_at: Date;
}
export interface Job {
    id: string;
    type: string;
    priority: number;
    data: Record<string, any>;
    status: "pending" | "running" | "completed" | "failed";
    created_at: Date;
    updated_at: Date;
    started_at?: Date;
    completed_at?: Date;
    error?: string;
}
export interface User {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    created_at: Date;
    updated_at: Date;
    last_login?: Date;
}
//# sourceMappingURL=adventure.d.ts.map