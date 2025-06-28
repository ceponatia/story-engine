'use client'

import { useState, useEffect } from 'react'
import { Copy, Key, Link, RefreshCw, Trash2 } from 'lucide-react'

import { TableData, getTableData, deleteTableRows } from '@/app/actions/admin'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface TableViewerProps {
  tableName: string
  data: TableData
  onRefresh: () => void
}

export function TableViewer({ tableName, data, onRefresh }: TableViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState(data)
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set())
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  const rowsPerPage = 50
  const totalPages = Math.ceil(tableData.total_rows / rowsPerPage)

  // Reset selection when data changes
  useEffect(() => {
    setTableData(data)
    setSelectedRows(new Set())
  }, [data])

  const loadPage = async (page: number) => {
    setLoading(true)
    try {
      const offset = (page - 1) * rowsPerPage
      const newData = await getTableData(tableName, rowsPerPage, offset)
      setTableData(newData)
      setCurrentPage(page)
      setSelectedRows(new Set()) // Clear selection when changing pages
    } catch (error) {
      console.error('Failed to load page:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCellValue = (value: any): string => {
    if (value === null) return 'NULL'
    if (value === undefined) return 'UNDEFINED'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
    return String(value)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getDataTypeColor = (dataType: string) => {
    if (dataType.includes('varchar') || dataType.includes('text')) return 'bg-blue-100 text-blue-800'
    if (dataType.includes('int') || dataType.includes('numeric')) return 'bg-green-100 text-green-800'
    if (dataType.includes('timestamp') || dataType.includes('date')) return 'bg-purple-100 text-purple-800'
    if (dataType.includes('boolean')) return 'bg-orange-100 text-orange-800'
    if (dataType.includes('uuid')) return 'bg-pink-100 text-pink-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getPrimaryKeyValue = (row: Record<string, any>) => {
    const primaryKeys = tableData.columns.filter(col => col.is_primary_key)
    if (primaryKeys.length === 1) {
      return row[primaryKeys[0].column_name]
    } else if (primaryKeys.length > 1) {
      // For composite keys, return an object
      const keyObj: Record<string, any> = {}
      primaryKeys.forEach(pk => {
        keyObj[pk.column_name] = row[pk.column_name]
      })
      return keyObj
    }
    return null
  }

  const toggleRowSelection = (row: Record<string, any>) => {
    const pkValue = getPrimaryKeyValue(row)
    if (pkValue === null) return

    const newSelected = new Set(selectedRows)
    const keyString = JSON.stringify(pkValue)
    
    if (newSelected.has(keyString)) {
      newSelected.delete(keyString)
    } else {
      newSelected.add(keyString)
    }
    setSelectedRows(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedRows.size === tableData.rows.length) {
      setSelectedRows(new Set())
    } else {
      const allKeys = new Set(
        tableData.rows.map(row => JSON.stringify(getPrimaryKeyValue(row))).filter(key => key !== 'null')
      )
      setSelectedRows(allKeys)
    }
  }

  const handleDelete = async () => {
    if (selectedRows.size === 0) return

    setDeleteLoading(true)
    try {
      const rowIds = Array.from(selectedRows).map(keyString => JSON.parse(keyString))
      const result = await deleteTableRows(tableName, rowIds)
      
      if (result.success) {
        setSelectedRows(new Set())
        onRefresh()
      } else {
        console.error('Delete failed:', result.error)
        alert(`Delete failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('An error occurred while deleting rows')
    } finally {
      setDeleteLoading(false)
    }
  }

  const isRowSelected = (row: Record<string, any>) => {
    const pkValue = getPrimaryKeyValue(row)
    return pkValue !== null && selectedRows.has(JSON.stringify(pkValue))
  }

  return (
    <div className="space-y-6">
      {/* Schema Information */}
      <div className="border rounded-lg">
        <div className="flex items-center justify-between p-4 border-b bg-card rounded-t-lg">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Table Schema</h3>
            <Badge variant="outline">{tableData.columns.length} columns</Badge>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-4 bg-card rounded-b-lg">
          <div className="space-y-2">
            {tableData.columns.map((column) => (
              <div key={column.column_name} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {column.is_primary_key && (
                      <Key className="h-3 w-3 text-yellow-600" title="Primary Key" />
                    )}
                    {column.is_foreign_key && (
                      <Link className="h-3 w-3 text-blue-600" title="Foreign Key" />
                    )}
                    <span className="font-medium">{column.column_name}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getDataTypeColor(column.data_type)}`}
                  >
                    {column.data_type}
                  </Badge>
                  {column.is_nullable === 'YES' && (
                    <Badge variant="outline" className="text-xs">
                      nullable
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {column.column_default && (
                    <span>default: {column.column_default}</span>
                  )}
                  {column.foreign_table && (
                    <span>→ {column.foreign_table}.{column.foreign_column}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-lg">
        <div className="flex items-center justify-between p-4 border-b bg-card rounded-t-lg">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Table Data</h3>
            <Badge variant="outline">{tableData.total_rows} total rows</Badge>
            {selectedRows.size > 0 && (
              <Badge variant="secondary">{selectedRows.size} selected</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.size > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete ({selectedRows.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Selected Rows</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedRows.size} row{selectedRows.size > 1 ? 's' : ''}? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 text-sm text-muted-foreground">
          <span>
            Showing {tableData.rows.length} rows
            {totalPages > 1 && ` (${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, tableData.total_rows)} of ${tableData.total_rows})`}
          </span>
        </div>
        <div className="max-h-96 overflow-auto bg-card rounded-b-lg">
          {tableData.rows.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No data found in this table
            </div>
          ) : (
            <div className="min-w-max">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-10 bg-background border-r w-[50px]">
                      <Checkbox
                        checked={selectedRows.size === tableData.rows.length && tableData.rows.length > 0}
                        onCheckedChange={toggleSelectAll}
                        disabled={tableData.rows.length === 0}
                      />
                    </TableHead>
                    {tableData.columns.map((column) => (
                      <TableHead key={column.column_name} className="min-w-[120px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {column.is_primary_key && (
                            <Key className="h-3 w-3 text-yellow-600" />
                          )}
                          {column.is_foreign_key && (
                            <Link className="h-3 w-3 text-blue-600" />
                          )}
                          <span>{column.column_name}</span>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="sticky right-0 z-10 bg-background border-l w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.rows.map((row, index) => {
                    const isSelected = isRowSelected(row)
                    return (
                      <TableRow key={index} className={isSelected ? 'bg-muted/50' : ''}>
                        <TableCell className={`sticky left-0 z-10 border-r ${isSelected ? 'bg-muted/50' : 'bg-background'}`}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRowSelection(row)}
                            disabled={getPrimaryKeyValue(row) === null}
                          />
                        </TableCell>
                        {tableData.columns.map((column) => (
                          <TableCell key={column.column_name} className="min-w-[120px] max-w-[200px]">
                            <div className="truncate" title={formatCellValue(row[column.column_name])}>
                              {formatCellValue(row[column.column_name])}
                            </div>
                          </TableCell>
                        ))}
                        <TableCell className={`sticky right-0 z-10 border-l ${isSelected ? 'bg-muted/50' : 'bg-background'}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(row, null, 2))}
                            title="Copy row as JSON"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}