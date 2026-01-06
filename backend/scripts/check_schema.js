const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:its@localhost:5432/test_process'
});

pool.query(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'global_tags'
  ORDER BY ordinal_position
`, (err, res) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('global_tags columns:');
  console.table(res.rows);
  pool.end();
});
