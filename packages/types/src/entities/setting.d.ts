export interface Setting {
    id: string;
    name: string;
    description?: string;
    world_type?: string;
    history?: string;
    tags?: string[];
    private: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
}
export interface SettingFormData {
    name: string;
    description?: string;
    world_type?: string;
    history?: string;
    tags?: string;
}
//# sourceMappingURL=setting.d.ts.map