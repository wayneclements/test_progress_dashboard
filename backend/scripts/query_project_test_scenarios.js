const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:its@localhost:5432/test_process'
});

pool.query('SELECT * FROM project_tags WHERE tag_name = $1', ['project_test_scenarios'], (err, res) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Results:');
  console.table(res.rows);
  pool.end();
});
