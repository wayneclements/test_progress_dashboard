const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const name = process.argv[2] || 'Project No. 1'

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    const res = await client.query('SELECT * FROM projects WHERE name = $1 ORDER BY id', [name])
    if (res.rows.length === 0) {
      console.log(`No rows found for name "${name}"`)
    } else {
      console.log(JSON.stringify(res.rows, null, 2))
    }
  } catch (err) {
    console.error('Query failed:', err.message || err)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()
