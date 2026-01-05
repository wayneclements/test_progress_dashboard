const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function queryGlobalDocuments() {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT * FROM global_documents ORDER BY id ASC'
    )
    
    console.log(`Found ${result.rows.length} documents in global_documents:\n`)
    console.log(JSON.stringify(result.rows, null, 2))
  } catch (err) {
    console.error('Error querying global_documents:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

queryGlobalDocuments()
