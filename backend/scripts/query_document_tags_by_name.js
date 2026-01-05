const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function queryDocumentTagsByName() {
  const client = await pool.connect()
  try {
    const result = await client.query(
      "SELECT * FROM document_tags WHERE tag_name = $1 ORDER BY id ASC",
      ['project_test_scenarios']
    )
    
    console.log(`Found ${result.rows.length} row(s) in document_tags where tag_name = 'project_test_scenarios':\n`)
    if (result.rows.length === 0) {
      console.log('No rows found.')
    } else {
      console.log(JSON.stringify(result.rows, null, 2))
    }
  } catch (err) {
    console.error('Error querying document_tags:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

queryDocumentTagsByName()
