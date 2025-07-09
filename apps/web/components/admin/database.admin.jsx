"use client";
import { useState, useEffect } from "react";
import { Database, Table, RefreshCw } from "lucide-react";
import { getTablesInfo, getTableData } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TableViewer } from "./table-viewer";
export function DatabaseAdmin() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tableData, setTableData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const loadTables = async () => {
        setLoading(true);
        try {
            const tablesData = await getTablesInfo();
            setTables(tablesData);
        }
        catch (err) {
            console.error("Failed to load tables:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const loadTableData = async (tableName) => {
        setTableLoading(true);
        try {
            const data = await getTableData(tableName);
            setTableData(data);
        }
        catch (err) {
            console.error("Failed to load table data:", err);
            setTableData(null);
        }
        finally {
            setTableLoading(false);
        }
    };
    const handleTableSelect = (tableName) => {
        setSelectedTable(tableName);
        loadTableData(tableName);
    };
    const handleRefresh = () => {
        loadTables();
        if (selectedTable) {
            loadTableData(selectedTable);
        }
    };
    useEffect(() => {
        loadTables();
    }, []);
    return (<>
      
      <div className="fixed top-14 left-0 w-64 h-[calc(100vh-3.5rem)] bg-sidebar border-r overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-4 w-4"/>
              <span className="font-medium">Database Tables</span>
            </div>
            <div className="space-y-1">
              {loading
            ? Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-8 w-full"/>))
            : tables.map((table) => (<button key={table.table_name} onClick={() => handleTableSelect(table.table_name)} className={`w-full p-2 text-left rounded text-sm transition-colors ${selectedTable === table.table_name
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Table className="h-4 w-4"/>
                          <span className="truncate">{table.table_name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {table.column_count}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {table.row_count}
                          </Badge>
                        </div>
                      </div>
                    </button>))}
            </div>
          </div>
        </div>
      </div>

      
      <div className="fixed top-14 left-64 right-0 bottom-0 bg-background overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-xl font-semibold">Database Admin</h1>
            {selectedTable && (<>
                <span className="text-muted-foreground">/</span>
                <span className="text-lg">{selectedTable}</span>
              </>)}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || tableLoading}>
            <RefreshCw className={`h-4 w-4 ${loading || tableLoading ? "animate-spin" : ""}`}/>
            Refresh
          </Button>
        </header>

        <div className="h-[calc(100%-4rem)] overflow-y-auto p-4">
          {!selectedTable ? (<div className="flex items-center justify-center h-full text-center">
              <div className="space-y-2">
                <Database className="h-12 w-12 mx-auto text-muted-foreground"/>
                <h2 className="text-xl font-medium">Select a table</h2>
                <p className="text-muted-foreground">
                  Choose a table from the sidebar to view its structure and data
                </p>
              </div>
            </div>) : tableLoading ? (<div className="space-y-4">
              <Skeleton className="h-8 w-full"/>
              <Skeleton className="h-32 w-full"/>
              <Skeleton className="h-96 w-full"/>
            </div>) : tableData ? (<TableViewer tableName={selectedTable} data={tableData} onRefresh={() => loadTableData(selectedTable)}/>) : (<div className="flex items-center justify-center h-full text-center">
              <div className="space-y-2">
                <Table className="h-12 w-12 mx-auto text-muted-foreground"/>
                <h2 className="text-xl font-medium">Failed to load table data</h2>
                <p className="text-muted-foreground">
                  There was an error loading the data for {selectedTable}
                </p>
                <Button onClick={() => loadTableData(selectedTable)}>Try Again</Button>
              </div>
            </div>)}
        </div>
      </div>
    </>);
}
