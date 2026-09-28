import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'uta_concert.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS ships (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE,
    capacity INTEGER NOT NULL DEFAULT 20
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

// Insert initial ships if they don't exist
const insertShip = db.prepare('INSERT OR IGNORE INTO ships (id, name, capacity) VALUES (?, ?, ?)');
insertShip.run(1, 'Mugiwara no Luffy', 20);
insertShip.run(2, "Shin'ei no Law", 20);
insertShip.run(3, 'Akagami no Shankusu', 20);
insertShip.run(4, 'Hyakujū no Kaidō', 20);

export default db;
