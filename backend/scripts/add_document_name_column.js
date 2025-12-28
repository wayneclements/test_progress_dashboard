const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    await client.query('ALTER TABLE document_tags ADD COLUMN IF NOT EXISTS document_name VARCHAR')
    console.log('✓ Added document_name column to document_tags table')
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message || err)
    process.exit(1)
  }
}

main()
