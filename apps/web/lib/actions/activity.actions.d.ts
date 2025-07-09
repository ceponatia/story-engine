export interface ActivityItem {
    id: string;
    type: "adventure" | "character" | "location" | "setting" | "message";
    title: string;
    description: string;
    timestamp: string;
    href: string;
    badge: "Active" | "Updated" | "New" | "Recent";
    entity_id: string;
    updated_at: string;
}
export declare function getRecentActivity(userId: string): Promise<ActivityItem[]>;
//# sourceMappingURL=activity.actions.d.ts.map