const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-now';
const ADMIN_COOKIE_NAME = 'bike_admin_session';
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'replace-with-long-random-secret';
const DB_PATH = path.join(__dirname, 'data', 'bike_business.db');

const db = new sqlite3.Database(DB_PATH);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

function sign(value) {
  return crypto.createHmac('sha256', COOKIE_SECRET).update(value).digest('hex');
}

function createAdminCookie() {
  const payload = `admin:${Date.now()}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function isValidAdminCookie(cookieValue) {
  if (!cookieValue || !cookieValue.includes('.')) return false;
  const lastDot = cookieValue.lastIndexOf('.');
  const payload = cookieValue.slice(0, lastDot);
  const signature = cookieValue.slice(lastDot + 1);
  return sign(payload) === signature && payload.startsWith('admin:');
}

function parseCookies(header = '') {
  return header
    .split(';')
    .map((v) => v.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const idx = pair.indexOf('=');
      if (idx > 0) {
        acc[pair.slice(0, idx)] = decodeURIComponent(pair.slice(idx + 1));
      }
      return acc;
    }, {});
}

function adminAuth(req, res, next) {
  const cookies = parseCookies(req.headers.cookie || '');
  if (isValidAdminCookie(cookies[ADMIN_COOKIE_NAME])) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      pickup_address TEXT NOT NULL,
      bike_type TEXT,
      repair_needs TEXT NOT NULL,
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Scheduled',
      quoted_price REAL,
      internal_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS pricing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const countRow = await get('SELECT COUNT(*) as count FROM pricing');
  if (!countRow || countRow.count === 0) {
    const defaults = [
      ['Basic Tune-Up', 'Brake + gear adjustment, safety check', 64],
      ['Full Tune-Up', 'Complete drivetrain clean + adjustments', 109],
      ['Flat Fix', 'Tube replacement and tire inspection', 22],
      ['Brake Service', 'Pad replacement and cable tuning', 34],
      ['Drivetrain Deep Clean', 'Degrease + chain service', 42],
      ['Wheel True', 'Single wheel spoke/tension correction', 27]
    ];

    for (const item of defaults) {
      await run(
        'INSERT INTO pricing (service_name, description, price) VALUES (?, ?, ?)',
        item
      );
    }
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/admin-assets', express.static(path.join(__dirname, 'admin')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  const cookies = parseCookies(req.headers.cookie || '');
  if (isValidAdminCookie(cookies[ADMIN_COOKIE_NAME])) {
    return res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
  }
  return res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get('/api/pricing', async (req, res) => {
  try {
    const prices = await all(
      'SELECT id, service_name, description, price FROM pricing WHERE active = 1 ORDER BY price ASC'
    );
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load pricing' });
  }
});

app.post('/api/bookings', async (req, res) => {
  const {
    customer_name,
    phone,
    email,
    pickup_address,
    bike_type,
    repair_needs,
    preferred_date,
    preferred_time
  } = req.body;

  if (!customer_name || !phone || !pickup_address || !repair_needs || !preferred_date || !preferred_time) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  try {
    const result = await run(
      `INSERT INTO bookings
      (customer_name, phone, email, pickup_address, bike_type, repair_needs, preferred_date, preferred_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_name,
        phone,
        email || '',
        pickup_address,
        bike_type || '',
        repair_needs,
        preferred_date,
        preferred_time
      ]
    );

    res.status(201).json({
      id: result.lastID,
      message: 'Pickup request submitted. You will receive confirmation shortly.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Could not submit booking.' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const cookie = createAdminCookie();
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(cookie)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`
  );
  return res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
  );
  return res.json({ ok: true });
});

app.get('/api/admin/bookings', adminAuth, async (req, res) => {
  try {
    const bookings = await all(`
      SELECT id, customer_name, phone, email, pickup_address, bike_type, repair_needs,
             preferred_date, preferred_time, status, quoted_price, internal_notes, created_at
      FROM bookings
      ORDER BY preferred_date ASC, preferred_time ASC, created_at DESC
    `);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

app.patch('/api/admin/bookings/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status, quoted_price, internal_notes, preferred_date, preferred_time } = req.body;

  try {
    const current = await get('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await run(
      `UPDATE bookings
       SET status = ?,
           quoted_price = ?,
           internal_notes = ?,
           preferred_date = ?,
           preferred_time = ?
       WHERE id = ?`,
      [
        status || current.status,
        quoted_price === '' || quoted_price == null ? current.quoted_price : Number(quoted_price),
        internal_notes == null ? current.internal_notes : internal_notes,
        preferred_date || current.preferred_date,
        preferred_time || current.preferred_time,
        id
      ]
    );

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

app.get('/api/admin/pricing', adminAuth, async (req, res) => {
  try {
    const pricing = await all('SELECT id, service_name, description, price, active FROM pricing ORDER BY price ASC');
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load pricing' });
  }
});

app.post('/api/admin/pricing', adminAuth, async (req, res) => {
  const { service_name, description, price } = req.body;
  if (!service_name || price == null) {
    return res.status(400).json({ error: 'Service name and price are required' });
  }

  try {
    const result = await run(
      'INSERT INTO pricing (service_name, description, price, active) VALUES (?, ?, ?, 1)',
      [service_name, description || '', Number(price)]
    );
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add pricing item' });
  }
});

app.patch('/api/admin/pricing/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { service_name, description, price, active } = req.body;

  try {
    const current = await get('SELECT * FROM pricing WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await run(
      `UPDATE pricing
       SET service_name = ?, description = ?, price = ?, active = ?
       WHERE id = ?`,
      [
        service_name || current.service_name,
        description == null ? current.description : description,
        price == null || price === '' ? current.price : Number(price),
        active == null ? current.active : Number(active),
        id
      ]
    );

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pricing item' });
  }
});

app.delete('/api/admin/pricing/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM pricing WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pricing item' });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Bike business scheduler running at http://localhost:${PORT}`);
      if (ADMIN_PASSWORD === 'change-me-now') {
        console.log('Set ADMIN_PASSWORD in your environment before production use.');
      }
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
