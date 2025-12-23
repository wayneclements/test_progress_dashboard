const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const targetDb = process.argv[2] || 'test_process'

function makePostgresConn() {
  const envUrl = process.env.DATABASE_URL || ''
  try {
    if (envUrl) {
      const u = new URL(envUrl)
      u.pathname = '/postgres'
      return u.toString()
    }
  } catch (e) {}
  return 'postgres://postgres:postgres@localhost:5432/postgres'
}

async function main() {
  const connectionString = makePostgresConn()
  const client = new Client({ connectionString })
  try {
    await client.connect()
    const check = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb])
    if (check.rows.length === 0) {
      console.log(`Database "${targetDb}" does not exist.`)
    } else {
      console.log(`Dropping database "${targetDb}"...`)
      await client.query(`DROP DATABASE "${targetDb}"`)
      console.log('Dropped.')
    }
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('Error dropping database:', err.message || err)
    try { await client.end() } catch (_) {}
    process.exit(1)
  }
}

main()
