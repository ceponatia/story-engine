export interface TableInfo {
    table_name: string;
    column_count: number;
    row_count: number;
}
export interface ColumnInfo {
    column_name: string;
    data_type: string;
    is_nullable: "YES" | "NO";
    column_default: string | null;
    is_primary_key: boolean;
    is_foreign_key: boolean;
    foreign_table?: string;
    foreign_column?: string;
}
export interface TableData {
    columns: ColumnInfo[];
    rows: Record<string, any>[];
    total_rows: number;
}
export declare function getTablesInfo(): Promise<TableInfo[]>;
export declare function getTableSchema(tableName: string): Promise<ColumnInfo[]>;
export declare function getTableData(tableName: string, limit?: number, offset?: number): Promise<TableData>;
export declare function deleteTableRows(tableName: string, rowIds: any[]): Promise<{
    success: boolean;
    deletedCount: number;
    error?: string;
}>;
//# sourceMappingURL=admin.d.ts.map