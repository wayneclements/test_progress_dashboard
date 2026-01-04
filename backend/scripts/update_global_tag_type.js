const { Client } = require('pg')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

async function main() {
  const conn = process.env.DATABASE_URL
  const client = new Client({ connectionString: conn, ssl: false })
  
  try {
    await client.connect()
    
    // Update the tag
    const updateResult = await client.query(
      'UPDATE global_tags SET type = $1 WHERE name = $2',
      ['date', 'project_delivery_date']
    )
    
    console.log('Update successful!')
    console.log('Rows affected: ' + updateResult.rowCount)
    
    // Verify the update
    const verifyResult = await client.query(
      'SELECT id, name, type FROM global_tags WHERE name = $1',
      ['project_delivery_date']
    )
    
    console.log('\nVerification:')
    verifyResult.rows.forEach(row => {
      console.log('ID: ' + row.id + ' | Name: ' + row.name + ' | Type: ' + row.type)
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

main()
