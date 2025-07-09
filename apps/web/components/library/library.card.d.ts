interface Props {
    item: {
        id: string;
        name?: string;
        title?: string;
        description?: string;
        age?: number;
        gender?: string;
        tags?: string[];
        created_at?: string;
    };
    type: string;
}
export declare function LibraryCard({ item, type }: Props): import("react").JSX.Element;
export {};
//# sourceMappingURL=library.card.d.ts.map