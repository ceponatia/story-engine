export interface Location {
    id: string;
    name: string;
    description?: string;
    notable_features?: string[];
    connected_locations?: string[];
    tags?: string[];
    private: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
}
export interface LocationFormData {
    name: string;
    description?: string;
    notable_features?: string;
    connected_locations?: string;
    tags?: string;
}
//# sourceMappingURL=location.d.ts.map