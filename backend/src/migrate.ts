import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function runMigrations() {
  const client = await pool.connect()
  try {
    const migrationDir = path.join(__dirname, '../migrations')
    const files = fs.readdirSync(migrationDir).sort()

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationDir, file)
        const sql = fs.readFileSync(filePath, 'utf-8')
        console.log(`Running migration: ${file}`)
        await client.query(sql)
        console.log(`✓ Completed: ${file}`)
      }
    }
    console.log('All migrations completed!')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()
