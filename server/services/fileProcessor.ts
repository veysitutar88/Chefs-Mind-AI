import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";
import * as XLSX from "xlsx";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function processCSVFile(filePath: string, originalName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const tableName = generateTableName(originalName);
    
    fs.createReadStream(filePath)
      .pipe(parse({ 
        columns: true, 
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          await createTableAndInsertData(tableName, results);
          
          // Clean up uploaded file
          fs.unlinkSync(filePath);
          
          resolve(tableName);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => reject(error));
  });
}

export async function processXLSXFile(filePath: string, originalName: string): Promise<string> {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      blankrows: false
    });
    
    if (data.length === 0) {
      throw new Error("No data found in Excel file");
    }
    
    // Convert to object format
    const headers = data[0] as string[];
    const rows = data.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = (row as any[])[index] || '';
      });
      return obj;
    });
    
    const tableName = generateTableName(originalName);
    await createTableAndInsertData(tableName, rows);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    return tableName;
  } catch (error) {
    // Clean up uploaded file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
}

function generateTableName(originalName: string): string {
  const baseName = path.parse(originalName).name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  
  const timestamp = Date.now();
  return `imported_${baseName}_${timestamp}`;
}

async function createTableAndInsertData(tableName: string, data: any[]): Promise<void> {
  if (data.length === 0) {
    throw new Error("No data to import");
  }
  
  const client = await pool.connect();
  
  try {
    // Analyze data to determine column types
    const columns = Object.keys(data[0]);
    const columnDefinitions = columns.map(col => {
      const colName = col.toLowerCase().replace(/[^a-z0-9]/g, '_');
      return `${colName} TEXT`;
    }).join(', ');
    
    // Create table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        ${columnDefinitions},
        imported_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await client.query(createTableQuery);
    
    // Insert data in batches
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const values = batch.map(row => {
        const rowValues = columns.map(col => {
          const value = row[col];
          return value === null || value === undefined ? null : String(value);
        });
        return rowValues;
      });
      
      if (values.length > 0) {
        const placeholders = values.map((_, rowIndex) => {
          const rowPlaceholders = columns.map((_, colIndex) => 
            `$${rowIndex * columns.length + colIndex + 1}`
          ).join(', ');
          return `(${rowPlaceholders})`;
        }).join(', ');
        
        const insertQuery = `
          INSERT INTO ${tableName} (${columns.map(col => col.toLowerCase().replace(/[^a-z0-9]/g, '_')).join(', ')})
          VALUES ${placeholders}
        `;
        
        const flatValues = values.flat();
        await client.query(insertQuery, flatValues);
      }
    }
    
    console.log(`Successfully imported ${data.length} rows into table ${tableName}`);
  } finally {
    client.release();
  }
}
