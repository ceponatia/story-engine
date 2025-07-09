interface Adventure {
    id: string;
    title: string;
    status: string;
    created_at: string;
    updated_at: string;
    characters?: {
        name: string;
    };
    locations?: {
        name: string;
    };
}
interface AdventuresListProps {
    adventures: Adventure[];
}
export declare function AdventuresList({ adventures }: AdventuresListProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=adventure.list.d.ts.map