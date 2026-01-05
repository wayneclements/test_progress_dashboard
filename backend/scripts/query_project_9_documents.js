const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function queryProjectDocuments() {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT * FROM project_documents WHERE project_name = $1 ORDER BY id ASC',
      ['Project No. 9']
    )
    
    console.log(`Found ${result.rows.length} documents for Project No. 9:\n`)
    console.log(JSON.stringify(result.rows, null, 2))
  } catch (err) {
    console.error('Error querying project_documents:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

queryProjectDocuments()
