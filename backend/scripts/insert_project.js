const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    const result = await client.query(
      'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *',
      ['Create a new project ...', 'Script to create a new project in the test_process database']
    )
    
    console.log('Row inserted successfully:')
    console.log(result.rows[0])
    
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('Error inserting row:', err.message || err)
    try { await client.end() } catch (_) {}
    process.exit(1)
  }
}

main()
