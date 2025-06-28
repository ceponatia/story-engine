#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const pool = new Pool({
  user: 'claude',
  host: 'localhost',
  database: 'storyengine',
  password: 'yurikml2',
  port: 5432,
});

async function extractSchema() {
  try {
    console.log('Connecting to database...');
    
    // Query to get all tables and their columns with detailed information
    const query = `
      SELECT 
        t.table_name,
        c.column_name,
        c.data_type,
        c.character_maximum_length,
        c.is_nullable,
        c.column_default,
        c.ordinal_position,
        CASE 
          WHEN pk.column_name IS NOT NULL THEN 'YES'
          ELSE 'NO'
        END as is_primary_key,
        CASE 
          WHEN fk.column_name IS NOT NULL THEN 'YES'
          ELSE 'NO'
        END as is_foreign_key,
        fk.foreign_table_name,
        fk.foreign_column_name
      FROM 
        information_schema.tables t
      LEFT JOIN 
        information_schema.columns c ON t.table_name = c.table_name
      LEFT JOIN (
        SELECT 
          kcu.column_name,
          kcu.table_name
        FROM 
          information_schema.table_constraints tc
        JOIN 
          information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE 
          tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name AND c.table_name = pk.table_name
      LEFT JOIN (
        SELECT 
          kcu.column_name,
          kcu.table_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM 
          information_schema.table_constraints tc
        JOIN 
          information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN 
          information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE 
          tc.constraint_type = 'FOREIGN KEY'
      ) fk ON c.column_name = fk.column_name AND c.table_name = fk.table_name
      WHERE 
        t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND c.column_name IS NOT NULL
      ORDER BY 
        t.table_name, c.ordinal_position;
    `;

    const result = await pool.query(query);
    
    console.log(`Found ${result.rows.length} columns across tables`);
    
    // Group columns by table
    const tables = {};
    result.rows.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push(row);
    });

    // Generate SQL schema
    let sqlSchema = `-- PostgreSQL Schema for Story Engine
-- Generated automatically on ${new Date().toISOString()}
-- Database: storyengine

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

`;

    // Generate CREATE TABLE statements
    Object.keys(tables).sort().forEach(tableName => {
      const columns = tables[tableName];
      
      sqlSchema += `-- Table: ${tableName}\n`;
      sqlSchema += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      
      const columnDefs = columns.map(col => {
        let def = `  ${col.column_name} `;
        
        // Handle data types
        switch (col.data_type) {
          case 'character varying':
            def += col.character_maximum_length ? `VARCHAR(${col.character_maximum_length})` : 'VARCHAR';
            break;
          case 'timestamp with time zone':
            def += 'TIMESTAMPTZ';
            break;
          case 'timestamp without time zone':
            def += 'TIMESTAMP';
            break;
          case 'boolean':
            def += 'BOOLEAN';
            break;
          case 'integer':
            def += 'INTEGER';
            break;
          case 'bigint':
            def += 'BIGINT';
            break;
          case 'uuid':
            def += 'UUID';
            break;
          case 'text':
            def += 'TEXT';
            break;
          case 'USER-DEFINED':
            def += 'VECTOR(1024)'; // Assuming vector type
            break;
          default:
            def += col.data_type.toUpperCase();
        }
        
        // Handle nullable
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        
        // Handle defaults
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        
        return def;
      });
      
      sqlSchema += columnDefs.join(',\n');
      
      // Add primary key constraint
      const primaryKeys = columns.filter(col => col.is_primary_key === 'YES');
      if (primaryKeys.length > 0) {
        sqlSchema += `,\n  PRIMARY KEY (${primaryKeys.map(pk => pk.column_name).join(', ')})`;
      }
      
      sqlSchema += '\n);\n\n';
      
      // Add foreign key constraints
      const foreignKeys = columns.filter(col => col.is_foreign_key === 'YES');
      foreignKeys.forEach(fk => {
        sqlSchema += `ALTER TABLE ${tableName} ADD CONSTRAINT fk_${tableName}_${fk.column_name} `;
        sqlSchema += `FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name});\n`;
      });
      
      if (foreignKeys.length > 0) {
        sqlSchema += '\n';
      }
    });

    // Add indexes section
    sqlSchema += `-- Indexes\n`;
    const indexQuery = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM 
        pg_indexes 
      WHERE 
        schemaname = 'public'
      ORDER BY 
        tablename, indexname;
    `;
    
    const indexResult = await pool.query(indexQuery);
    indexResult.rows.forEach(idx => {
      if (!idx.indexname.includes('_pkey')) { // Skip primary key indexes
        sqlSchema += `${idx.indexdef};\n`;
      }
    });

    // Write to schema.sql file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    fs.writeFileSync(schemaPath, sqlSchema);
    
    console.log(`Schema extracted and saved to: ${schemaPath}`);
    console.log(`Tables found: ${Object.keys(tables).join(', ')}`);
    
  } catch (error) {
    console.error('Error extracting schema:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the extraction
extractSchema();