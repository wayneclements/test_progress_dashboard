const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function queryGlobalTags() {
  const client = await pool.connect()
  try {
    const result = await client.query(
      "SELECT * FROM global_tags WHERE name = $1 ORDER BY id ASC",
      ['project_test_scenarios']
    )
    
    console.log(`Found ${result.rows.length} rows in global_tags where name = 'project_test_scenarios':\n`)
    if (result.rows.length === 0) {
      console.log('No rows found.')
    } else {
      console.log(JSON.stringify(result.rows, null, 2))
    }
  } catch (err) {
    console.error('Error querying global_tags:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

queryGlobalTags()
