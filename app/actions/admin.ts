'use server'

import { getDatabase } from '@/lib/database/pool'

export interface TableInfo {
  table_name: string
  column_count: number
  row_count: number
}

export interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: 'YES' | 'NO'
  column_default: string | null
  is_primary_key: boolean
  is_foreign_key: boolean
  foreign_table?: string
  foreign_column?: string
}

export interface TableData {
  columns: ColumnInfo[]
  rows: Record<string, any>[]
  total_rows: number
}

export async function getTablesInfo(): Promise<TableInfo[]> {
  try {
    const db = getDatabase()
    const result = await db.query(`
      SELECT 
        t.table_name,
        (
          SELECT COUNT(*) 
          FROM information_schema.columns c 
          WHERE c.table_name = t.table_name 
          AND c.table_schema = 'public'
        ) as column_count,
        COALESCE(
          (
            SELECT n_tup_ins 
            FROM pg_stat_user_tables 
            WHERE relname = t.table_name
          ), 0
        ) as row_count
      FROM information_schema.tables t
      WHERE t.table_schema = 'public' 
      AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name
    `)
    
    return result.rows
  } catch (error) {
    console.error('Error fetching tables info:', error)
    return []
  }
}

export async function getTableSchema(tableName: string): Promise<ColumnInfo[]> {
  try {
    const db = getDatabase()
    const result = await db.query(`
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
        CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
        fk.foreign_table_name as foreign_table,
        fk.foreign_column_name as foreign_column
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.table_name = $1
          AND tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name
      LEFT JOIN (
        SELECT 
          ku.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = $1
          AND tc.constraint_type = 'FOREIGN KEY'
      ) fk ON c.column_name = fk.column_name
      WHERE c.table_name = $1
        AND c.table_schema = 'public'
      ORDER BY c.ordinal_position
    `, [tableName])
    
    return result.rows
  } catch (error) {
    console.error('Error fetching table schema:', error)
    return []
  }
}

export async function getTableData(tableName: string, limit: number = 50, offset: number = 0): Promise<TableData> {
  try {
    // Get column information
    const columns = await getTableSchema(tableName)
    
    const db = getDatabase()
    // Get actual data with limit and offset
    const dataResult = await db.query(`
      SELECT * FROM "${tableName}" 
      ORDER BY 1 
      LIMIT $1 OFFSET $2
    `, [limit, offset])
    
    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total FROM "${tableName}"
    `)
    
    return {
      columns,
      rows: dataResult.rows,
      total_rows: parseInt(countResult.rows[0].total)
    }
  } catch (error) {
    console.error('Error fetching table data:', error)
    return {
      columns: [],
      rows: [],
      total_rows: 0
    }
  }
}

export async function deleteTableRows(tableName: string, rowIds: any[]): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    const db = getDatabase()
    
    // Get primary key column(s) for the table
    const pkResult = await db.query(`
      SELECT column_name
      FROM information_schema.key_column_usage
      WHERE table_name = $1
        AND constraint_name IN (
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_name = $1
            AND constraint_type = 'PRIMARY KEY'
        )
      ORDER BY ordinal_position
    `, [tableName])
    
    if (pkResult.rows.length === 0) {
      return { success: false, deletedCount: 0, error: 'No primary key found for this table' }
    }
    
    const primaryKeyColumns = pkResult.rows.map(row => row.column_name)
    
    // For single primary key column, build simple WHERE IN clause
    if (primaryKeyColumns.length === 1) {
      const pkColumn = primaryKeyColumns[0]
      const placeholders = rowIds.map((_, index) => `$${index + 2}`).join(', ')
      
      const deleteResult = await db.query(`
        DELETE FROM "${tableName}" 
        WHERE "${pkColumn}" IN (${placeholders})
      `, [tableName, ...rowIds])
      
      return { 
        success: true, 
        deletedCount: deleteResult.rowCount || 0 
      }
    } else {
      // For composite primary keys, build OR conditions
      const conditions = rowIds.map((id, index) => {
        const idObj = typeof id === 'object' ? id : { [primaryKeyColumns[0]]: id }
        const columnConditions = primaryKeyColumns.map(col => `"${col}" = $${index * primaryKeyColumns.length + primaryKeyColumns.indexOf(col) + 2}`)
        return `(${columnConditions.join(' AND ')})`
      }).join(' OR ')
      
      const values = rowIds.flatMap(id => {
        const idObj = typeof id === 'object' ? id : { [primaryKeyColumns[0]]: id }
        return primaryKeyColumns.map(col => idObj[col])
      })
      
      const deleteResult = await db.query(`
        DELETE FROM "${tableName}" 
        WHERE ${conditions}
      `, [tableName, ...values])
      
      return { 
        success: true, 
        deletedCount: deleteResult.rowCount || 0 
      }
    }
  } catch (error) {
    console.error('Error deleting table rows:', error)
    return { 
      success: false, 
      deletedCount: 0, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}