const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
require('dotenv').config();

const { getPool, sql } = require('./db');

const app    = express();
const PORT   = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || 'dev_secret';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// ── Auth middleware ───────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

// ════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password)
    return res.status(400).json({ success: false, error: 'All fields required' });

  try {
    const pool = await getPool();

    const existing = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT UserID FROM Users WHERE Email = @email');
    if (existing.recordset.length)
      return res.status(409).json({ success: false, error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('fullName', sql.NVarChar, fullName)
      .input('email',    sql.NVarChar, email)
      .input('hash',     sql.NVarChar, hash)
      .query(`INSERT INTO Users (FullName, Email, PasswordHash, Role, Username)
              OUTPUT INSERTED.UserID
              VALUES (@fullName, @email, @hash, 'User', @email)`);

    const userId = result.recordset[0].UserID;
    const token  = jwt.sign({ userId, email, fullName }, SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { userId, email, fullName } });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, error: 'Email and password required' });

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT UserID, FullName, Email, PasswordHash FROM Users WHERE Email = @email');

    if (!result.recordset.length)
      return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match)
      return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user.UserID, email: user.Email, fullName: user.FullName },
      SECRET, { expiresIn: '7d' }
    );
    res.json({ success: true, token, user: { userId: user.UserID, email: user.Email, fullName: user.FullName } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ════════════════════════════════════════
//  PRODUCT ROUTES
// ════════════════════════════════════════

app.get('/api/products', async (req, res) => {
  try {
    const pool = await getPool();
    const { sort, minPrice, maxPrice, category } = req.query;

    let query = `
      SELECT p.ProductID, p.ProductName, p.Price, p.ImagePath, p.Rating, p.StockQty,
             c.CategoryName
      FROM Products p
      JOIN Categories c ON p.CategoryID = c.CategoryID
      WHERE p.IsActive = 1
    `;
    if (category)   query += ` AND c.CategoryName = '${category.replace(/'/g,"''")}'`;
    if (minPrice)   query += ` AND p.Price >= ${parseFloat(minPrice)}`;
    if (maxPrice)   query += ` AND p.Price <= ${parseFloat(maxPrice)}`;

    if (sort === 'price_asc')    query += ' ORDER BY p.Price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.Price DESC';
    else if (sort === 'rating')  query += ' ORDER BY p.Rating DESC';
    else                          query += ' ORDER BY p.ProductID ASC';

    const result = await pool.request().query(query);
    res.json({ success: true, products: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`SELECT p.*, c.CategoryName FROM Products p
              JOIN Categories c ON p.CategoryID = c.CategoryID
              WHERE p.ProductID = @id AND p.IsActive = 1`);
    if (!result.recordset.length)
      return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, product: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Categories ORDER BY CategoryName');
    res.json({ success: true, categories: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════
//  ORDER ROUTES
// ════════════════════════════════════════

// POST /api/orders  — place an order
app.post('/api/orders', async (req, res) => {
  const { customer, items, total, shippingAddress } = req.body;
  if (!customer || !items?.length)
    return res.status(400).json({ success: false, error: 'Invalid order data' });

  try {
    const pool = await getPool();

    // Upsert guest customer
    let customerId;
    const existing = await pool.request()
      .input('email', sql.NVarChar, customer.email)
      .query('SELECT CustomerID FROM Customers WHERE Email = @email');

    if (existing.recordset.length) {
      customerId = existing.recordset[0].CustomerID;
    } else {
      const ins = await pool.request()
        .input('firstName', sql.NVarChar, customer.firstName)
        .input('lastName',  sql.NVarChar, customer.lastName || '')
        .input('email',     sql.NVarChar, customer.email)
        .input('phone',     sql.NVarChar, customer.phone || '')
        .input('address',   sql.NVarChar, shippingAddress || '')
        .query(`INSERT INTO Customers (FirstName,LastName,Email,Phone,Address)
                OUTPUT INSERTED.CustomerID
                VALUES (@firstName,@lastName,@email,@phone,@address)`);
      customerId = ins.recordset[0].CustomerID;
    }

    // Insert order
    const orderResult = await pool.request()
      .input('customerId',      sql.Int,          customerId)
      .input('total',           sql.Decimal(10,2), total)
      .input('shippingAddress', sql.NVarChar,      shippingAddress || '')
      .query(`INSERT INTO Orders (CustomerID, TotalAmount, ShippingAddr, Status)
              OUTPUT INSERTED.OrderID
              VALUES (@customerId, @total, @shippingAddress, 'Confirmed')`);
    const orderId = orderResult.recordset[0].OrderID;

    // Insert order items
    for (const item of items) {
      await pool.request()
        .input('orderId',   sql.Int,          orderId)
        .input('productId', sql.Int,          item.id)
        .input('qty',       sql.Int,          item.quantity)
        .input('price',     sql.Decimal(10,2), item.price)
        .query(`INSERT INTO OrderItems (OrderID, ProductID, Quantity, UnitPrice)
                VALUES (@orderId, @productId, @qty, @price)`);
    }

    res.json({ success: true, orderId, message: 'Order placed successfully!' });
  } catch (err) {
    console.error('Order error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:id  — get order details
app.get('/api/orders/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const order = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`SELECT o.*, c.FirstName, c.LastName, c.Email
              FROM Orders o JOIN Customers c ON o.CustomerID = c.CustomerID
              WHERE o.OrderID = @id`);
    if (!order.recordset.length)
      return res.status(404).json({ success: false, error: 'Order not found' });

    const items = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`SELECT oi.*, p.ProductName, p.ImagePath
              FROM OrderItems oi JOIN Products p ON oi.ProductID = p.ProductID
              WHERE oi.OrderID = @id`);

    res.json({ success: true, order: order.recordset[0], items: items.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Health check ──────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1');
    res.json({ success: true, status: 'Connected', database: 'webData' });
  } catch (err) {
    res.status(500).json({ success: false, status: 'DB error', error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`\n🛍️  Bae's Kankan server → http://localhost:${PORT}`);
  console.log(`📦  API           → http://localhost:${PORT}/api/products`);
  console.log(`🔐  Auth          → http://localhost:${PORT}/api/auth/login`);
  console.log(`📋  Orders        → http://localhost:${PORT}/api/orders\n`);
  try { await getPool(); } catch {}
});
