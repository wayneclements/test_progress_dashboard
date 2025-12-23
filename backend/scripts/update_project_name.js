const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  const targetId = parseInt(process.argv[2], 10) || 4
  const newName = process.argv[3] || 'Project No. 4'
  try {
    await client.connect()
    const res = await client.query('UPDATE projects SET name = $1 WHERE id = $2 RETURNING id, name', [newName, targetId])
    if (res.rows.length === 0) {
      console.log(`No row updated for id ${targetId}`)
    } else {
      console.log('Updated:', res.rows[0])
    }
  } catch (err) {
    console.error('Update failed:', err.message || err)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()
