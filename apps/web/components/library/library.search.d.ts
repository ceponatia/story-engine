interface LibrarySearchProps {
    type: string;
    onSearch?: (query: string) => void;
    onFilter?: (filters: Record<string, string>) => void;
}
export declare function LibrarySearch({ type, onSearch, onFilter }: LibrarySearchProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=library.search.d.ts.map