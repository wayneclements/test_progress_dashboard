const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function queryAllProjectTags() {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT * FROM project_tags ORDER BY id ASC'
    )
    
    console.log(`Found ${result.rows.length} rows in project_tags:\n`)
    console.log(JSON.stringify(result.rows, null, 2))
  } catch (err) {
    console.error('Error querying project_tags:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

queryAllProjectTags()
