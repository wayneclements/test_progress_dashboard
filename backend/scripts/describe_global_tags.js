const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function describeGlobalTags() {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'global_tags'
      ORDER BY ordinal_position
    `)
    
    console.log('Columns in global_tags table:\n')
    result.rows.forEach((col) => {
      console.log(`Column: ${col.column_name}`)
      console.log(`  Type: ${col.data_type}`)
      console.log(`  Nullable: ${col.is_nullable}`)
      console.log(`  Default: ${col.column_default || 'None'}`)
      console.log()
    })
  } catch (err) {
    console.error('Error describing global_tags:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

describeGlobalTags()
