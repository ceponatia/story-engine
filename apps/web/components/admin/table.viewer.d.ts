import { TableData } from "@/lib/actions/admin";
interface TableViewerProps {
    tableName: string;
    data: TableData;
    onRefresh: () => void;
}
export declare function TableViewer({ tableName, data, onRefresh }: TableViewerProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=table.viewer.d.ts.map