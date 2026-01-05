const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function updateGlobalTag() {
  const client = await pool.connect()
  try {
    const result = await client.query(
      "UPDATE global_tags SET type = $1 WHERE name = $2 RETURNING *",
      ['table', 'project_test_scenarios']
    )
    
    console.log(`Updated ${result.rows.length} row(s):\n`)
    if (result.rows.length === 0) {
      console.log('No rows found to update.')
    } else {
      console.log(JSON.stringify(result.rows, null, 2))
    }
  } catch (err) {
    console.error('Error updating global_tags:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

updateGlobalTag()
