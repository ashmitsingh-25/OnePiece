import express from 'express';
import cors from 'cors';
import db from './db';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const OFFER_DURATION_MS = 10 * 60 * 1000;

// Helper to get next eligible waitlisted participant and offer them a seat
function offerNextSeat(shipId: number) {
  // Check if we have an available seat
  const ship = db.prepare('SELECT capacity FROM ships WHERE id = ?').get(shipId) as any;
  const confirmed = db.prepare(`SELECT COUNT(*) as count FROM registrations WHERE ship_id = ? AND status IN ('CONFIRMED', 'OFFERED')`).get(shipId) as any;
  
  if (confirmed.count >= ship.capacity) return; // No seats available

  // Find next waitlisted
  const nextInLine = db.prepare(`SELECT id FROM registrations WHERE ship_id = ? AND status = 'WAITLISTED' ORDER BY created_at ASC LIMIT 1`).get(shipId) as any;
  
  if (nextInLine) {
    const expiresAt = Date.now() + OFFER_DURATION_MS;
    db.prepare(`UPDATE registrations SET status = 'OFFERED', expires_at = ? WHERE id = ?`).run(expiresAt, nextInLine.id);
  }
}

// Background job to expire offers
setInterval(() => {
  const now = Date.now();
  const expiredOffers = db.prepare(`SELECT id, ship_id FROM registrations WHERE status = 'OFFERED' AND expires_at <= ?`).all(now) as any[];
  
  for (const offer of expiredOffers) {
    db.prepare(`UPDATE registrations SET status = 'EXPIRED' WHERE id = ?`).run(offer.id);
    offerNextSeat(offer.ship_id);
  }
}, 5000); // Check every 5 seconds

// Endpoints

app.get('/api/ships', (req, res) => {
  const ships = db.prepare('SELECT * FROM ships').all() as any[];
  const stats = ships.map(ship => {
    const confirmed = db.prepare(`SELECT COUNT(*) as count FROM registrations WHERE ship_id = ? AND status = 'CONFIRMED'`).get(ship.id) as any;
    const offered = db.prepare(`SELECT COUNT(*) as count FROM registrations WHERE ship_id = ? AND status = 'OFFERED'`).get(ship.id) as any;
    const waitlisted = db.prepare(`SELECT COUNT(*) as count FROM registrations WHERE ship_id = ? AND status = 'WAITLISTED'`).get(ship.id) as any;
    
    return {
      ...ship,
      confirmedCount: confirmed.count,
      offeredCount: offered.count,
      totalOccupied: confirmed.count + offered.count,
      waitlistCount: waitlisted.count
    };
  });
  res.json(stats);
});

app.post('/api/register', (req, res) => {
  const { pirateName, fullName, email, phoneNumber, shipId } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM registrations WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: "You're already part of this crew." });
    }

    const ship = db.prepare('SELECT capacity FROM ships WHERE id = ?').get(shipId) as any;
    if (!ship) return res.status(404).json({ error: "Ship not found" });

    const occupied = db.prepare(`SELECT COUNT(*) as count FROM registrations WHERE ship_id = ? AND status IN ('CONFIRMED', 'OFFERED')`).get(shipId) as any;
    
    let status = "WAITLISTED";
    let expiresAt = null;

    if (occupied.count < ship.capacity) {
      status = "CONFIRMED";
    }

    const id = crypto.randomUUID();
    db.prepare('INSERT INTO registrations (id, pirate_name, full_name, email, phone_number, ship_id, status, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, pirateName, fullName, email, phoneNumber, shipId, status, Date.now(), expiresAt
    );

    res.json({ id, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/registration/:id', (req, res) => {
  const { id } = req.params;
  const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id) as any;
  if (!reg) return res.status(404).json({ error: "Not found" });

  const ship = db.prepare('SELECT * FROM ships WHERE id = ?').get(reg.ship_id) as any;
  
  let queuePosition = null;
  let peopleAhead = null;
  
  if (reg.status === "WAITLISTED") {
    const queue = db.prepare(`SELECT id FROM registrations WHERE ship_id = ? AND status = 'WAITLISTED' ORDER BY created_at ASC`).all(reg.ship_id) as any[];
    const index = queue.findIndex(q => q.id === id);
    if (index !== -1) {
      queuePosition = index + 1;
      peopleAhead = index;
    }
  }

  res.json({ ...reg, ship, queuePosition, peopleAhead });
});

app.post('/api/action', (req, res) => {
  const { id, action } = req.body; // action: ACCEPT, DECLINE, CANCEL
  const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id) as any;
  
  if (!reg) return res.status(404).json({ error: "Not found" });

  if (action === "ACCEPT" && reg.status === "OFFERED") {
    db.prepare(`UPDATE registrations SET status = 'CONFIRMED', expires_at = NULL WHERE id = ?`).run(id);
    res.json({ success: true });
  } else if (action === "DECLINE" && reg.status === "OFFERED") {
    db.prepare(`UPDATE registrations SET status = 'DECLINED', expires_at = NULL WHERE id = ?`).run(id);
    offerNextSeat(reg.ship_id);
    res.json({ success: true });
  } else if (action === "CANCEL" && reg.status === "CONFIRMED") {
    db.prepare(`UPDATE registrations SET status = 'CANCELLED' WHERE id = ?`).run(id);
    offerNextSeat(reg.ship_id);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid action for current status" });
  }
});

app.post('/api/admin/simulate_expire', (req, res) => {
  const { id } = req.body;
  const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id) as any;
  if (reg && reg.status === "OFFERED") {
    db.prepare(`UPDATE registrations SET status = 'EXPIRED', expires_at = NULL WHERE id = ?`).run(id);
    offerNextSeat(reg.ship_id);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Cannot expire" });
  }
});

app.get('/api/admin/all', (req, res) => {
  const registrations = db.prepare('SELECT * FROM registrations ORDER BY created_at DESC').all();
  res.json(registrations);
});

// Demo login hack: user can 'login' by typing their email
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  const reg = db.prepare('SELECT id FROM registrations WHERE email = ?').get(email) as any;
  if (reg) {
    res.json({ id: reg.id });
  } else {
    res.status(404).json({ error: "Pirate not found. Board the ship to create your identity!" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
