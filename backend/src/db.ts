import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'uta_concert.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS ships (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE,
    capacity INTEGER NOT NULL DEFAULT 20,
    price INTEGER NOT NULL DEFAULT 15000
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    pirate_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT NOT NULL,
    ship_id INTEGER NOT NULL,
    status TEXT NOT NULL, -- CONFIRMED, WAITLISTED, OFFERED, CANCELLED, EXPIRED, DECLINED
    created_at INTEGER NOT NULL,
    expires_at INTEGER,
    FOREIGN KEY (ship_id) REFERENCES ships(id)
  );
`);

// Try to add price column if upgrading from old schema
try {
  db.exec('ALTER TABLE ships ADD COLUMN price INTEGER NOT NULL DEFAULT 15000');
} catch (e) {
  // Ignore error if column already exists
}

// Update existing ship names and prices if they exist
const updateShip = db.prepare('UPDATE ships SET name = ?, price = ? WHERE id = ?');
updateShip.run('1000 SUNNY', 15000, 1);
updateShip.run('POLAR TANG', 18000, 2);
updateShip.run('RED FORCE', 20000, 3);
updateShip.run('MOBY DICK', 25000, 4);

// Insert initial ships if they don't exist
const insertShip = db.prepare('INSERT OR IGNORE INTO ships (id, name, capacity, price) VALUES (?, ?, ?, ?)');
insertShip.run(1, '1000 SUNNY', 20, 15000);
insertShip.run(2, 'POLAR TANG', 20, 18000);
insertShip.run(3, 'RED FORCE', 20, 20000);
insertShip.run(4, 'MOBY DICK', 20, 25000);

export default db;
