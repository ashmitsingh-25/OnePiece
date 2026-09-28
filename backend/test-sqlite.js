const Database = require('better-sqlite3');
try {
  const db = new Database(':memory:');
  console.log('better-sqlite3 works!');
} catch (e) {
  console.error('Failed:', e);
}
