export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RouteItem {
  method: HttpMethod;
  path: string;
  desc: string;
  tables: string[];
  code: string;
}

export interface RouteGroup {
  group: string;
  color: string;
  items: RouteItem[];
}

export const METHOD_COLOR: Record<HttpMethod, string> = {
  GET: "#10B981",
  POST: "#3B82F6",
  PUT: "#F59E0B",
  DELETE: "#EF4444",
  PATCH: "#8B5CF6",
};

export const TABLE_COLOR: Record<string, string> = {
  users: "#3B82F6",
  addresses: "#3B82F6",
  stores: "#7C3AED",
  products: "#059669",
  product_variants: "#059669",
  product_images: "#059669",
  categories: "#059669",
  variant_attributes: "#059669",
  orders: "#D97706",
  order_items: "#D97706",
  payments: "#D97706",
  shipments: "#D97706",
  carts: "#DB2777",
  cart_items: "#DB2777",
  reviews: "#DB2777",
  coupons: "#DB2777",
  // TLS "modules" — not DB tables, used as concept tags
  "node:https": "#0EA5E9",
  "node:tls": "#0EA5E9",
  "node:crypto": "#A78BFA",
  "node:fs": "#F472B6",
};

// ─── Node.js HTTPS / TLS route group ───────────────────────────────────────
export const HTTPS_GROUP: RouteGroup = {
  group: "Node HTTPS / TLS",
  color: "#0EA5E9",
  items: [
    {
      method: "POST",
      path: "https.createServer (PEM)",
      desc: "Create an HTTPS server using PEM key + cert files",
      tables: ["node:https", "node:fs"],
      code: `const https = require('node:https');
const fs    = require('node:fs');

const options = {
  key:  fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
};

// Generate self-signed cert for local dev:
// openssl req -x509 -newkey rsa:2048 -nodes -sha256 \\
//   -subj '/CN=localhost' \\
//   -keyout private-key.pem -out certificate.pem

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello world\\n');
}).listen(8000);`,
    },
    {
      method: "POST",
      path: "https.createServer (PFX)",
      desc: "Create an HTTPS server using a PKCS#12 (.pfx) bundle",
      tables: ["node:https", "node:fs"],
      code: `const https = require('node:https');
const fs    = require('node:fs');

const options = {
  pfx:        fs.readFileSync('test_cert.pfx'),
  passphrase: 'sample',
};

// Build the .pfx bundle from PEM files:
// openssl pkcs12 -certpbe AES-256-CBC -export \\
//   -out test_cert.pfx \\
//   -inkey private-key.pem -in certificate.pem \\
//   -passout pass:sample

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello world\\n');
}).listen(8000);`,
    },
    {
      method: "GET",
      path: "https.get (shorthand)",
      desc: "Simple GET request using the https.get() shorthand",
      tables: ["node:https"],
      code: `const https = require('node:https');

// https.get is a convenience wrapper — no req.end() needed
https.get('https://encrypted.google.com/', (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:',    res.headers);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
}).on('error', (e) => {
  console.error(e);
});`,
    },
    {
      method: "GET",
      path: "https.request (full options)",
      desc: "Full HTTPS GET using https.request() with explicit options",
      tables: ["node:https"],
      code: `const https = require('node:https');

const options = {
  hostname: 'encrypted.google.com',
  port:     443,
  path:     '/',
  method:   'GET',
};

const req = https.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:',    res.headers);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error(e);
});

// Unlike https.get(), you must call req.end() manually
req.end();`,
    },
    {
      method: "GET",
      path: "https.request (client cert + Agent)",
      desc: "Authenticate with a client certificate via https.Agent",
      tables: ["node:https", "node:fs"],
      code: `const https = require('node:https');
const fs    = require('node:fs');

// Attach the client cert to an Agent so it's reused across requests
const options = {
  hostname: 'encrypted.google.com',
  port:     443,
  path:     '/',
  method:   'GET',
  key:      fs.readFileSync('private-key.pem'),
  cert:     fs.readFileSync('certificate.pem'),
};

// new https.Agent caches TLS sessions for the same host:port
options.agent = new https.Agent(options);

const req = https.request(options, (res) => {
  // handle response...
});`,
    },
    {
      method: "GET",
      path: "https.request (agent: false)",
      desc: "Bypass the default connection pool — one-off TLS socket",
      tables: ["node:https", "node:fs"],
      code: `const https = require('node:https');
const fs    = require('node:fs');

// agent: false creates a fresh socket for this single request.
// Useful when you need per-request cert or want to avoid pooling.
const options = {
  hostname: 'encrypted.google.com',
  port:     443,
  path:     '/',
  method:   'GET',
  key:      fs.readFileSync('private-key.pem'),
  cert:     fs.readFileSync('certificate.pem'),
  agent:    false,   // ← no connection reuse
};

const req = https.request(options, (res) => {
  // handle response...
});`,
    },
    {
      method: "GET",
      path: "Certificate pinning (sha256)",
      desc: "Pin a server's public key & exact cert fingerprint via checkServerIdentity",
      tables: ["node:tls", "node:https", "node:crypto"],
      code: `const tls    = require('node:tls');
const https  = require('node:https');
const crypto = require('node:crypto');

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('base64');
}

const options = {
  hostname: 'github.com',
  port:     443,
  path:     '/',
  method:   'GET',

  checkServerIdentity(host, cert) {
    // 1. Standard hostname check first
    const err = tls.checkServerIdentity(host, cert);
    if (err) return err;

    // 2. Pin the public key (HPKP-style pin-sha256)
    const pubkey256 = 'SIXvRyDmBJSgatgTQRGbInBaAK+hZOQ18UmrSwnDlK8=';
    if (sha256(cert.pubkey) !== pubkey256) {
      return new Error(
        \`Certificate verification error: The public key of '\${cert.subject.CN}' \` +
        'does not match our pinned fingerprint'
      );
    }

    // 3. Pin the exact leaf certificate SHA-256 fingerprint
    const cert256 =
      'FD:6E:9B:0E:F3:98:BC:D9:04:C3:B2:EC:16:7A:7B:' +
      '0F:DA:72:01:C9:03:C5:3A:6A:6A:E5:D0:41:43:63:EF:65';
    if (cert.fingerprint256 !== cert256) {
      return new Error(
        \`Certificate verification error: The certificate of '\${cert.subject.CN}' \` +
        'does not match our pinned fingerprint'
      );
    }

    // Walk the chain for informational logging
    do {
      console.log('Subject Common Name:', cert.subject.CN);
      console.log('  Certificate SHA256 fingerprint:', cert.fingerprint256);
      console.log('  Public key pin-sha256:', sha256(cert.pubkey));
      cert = cert.issuerCertificate;
    } while (cert.fingerprint256 !== cert.issuerCertificate?.fingerprint256);
  },
};

options.agent = new https.Agent(options);

const req = https.request(options, (res) => {
  console.log('All OK. Server matched our pinned cert or public key');
  console.log('statusCode:', res.statusCode);
  res.on('data', () => {});
});

req.on('error', (e) => { console.error(e.message); });
req.end();`,
    },
    {
      method: "GET",
      path: "TLS keylog (SSLKEYLOGFILE)",
      desc: "Capture TLS session keys to a file for Wireshark decryption",
      tables: ["node:https", "node:fs"],
      code: `// Dynamically import https (ESM-safe pattern)
let https;
try {
  https = await import('node:https');
} catch (err) {
  console.error('https support is disabled!');
}

// Log TLS session keys so Wireshark can decrypt captures.
// ⚠️  NEVER do this in production — exposes all encrypted traffic.
https.globalAgent.on('keylog', (line, tlsSocket) => {
  fs.appendFileSync('/tmp/ssl-keys.log', line, { mode: 0o600 });
});

// Then make your request normally:
// curl -k https://localhost:8000/`,
    },
  ],
};

export const CONCEPTS = [
  { term: "$1, $2, $3", desc: "Parameterized queries — prevent SQL injection" },
  { term: "BEGIN / COMMIT / ROLLBACK", desc: "Transactions keep data consistent" },
  { term: "Promise.all()", desc: "Parallel queries = faster responses" },
  { term: "ON CONFLICT DO UPDATE", desc: "Upsert — insert or update in one query" },
];

export const ROUTES: RouteGroup[] = [
  HTTPS_GROUP,
  {
    group: "Auth",
    color: "#3B82F6",
    items: [
      {
        method: "POST",
        path: "/api/auth/register",
        desc: "Create a new user account",
        tables: ["users"],
        code: `// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  // Hash password — NEVER store plain text
  const password_hash = await bcrypt.hash(password, 12);

  const { rows } = await db.query(\`
    INSERT INTO users (email, password_hash, first_name, last_name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, first_name, last_name, created_at
  \`, [email, password_hash, first_name, last_name]);

  // Sign a JWT so the user stays logged in
  const token = jwt.sign({ userId: rows[0].id }, process.env.JWT_SECRET);
  res.status(201).json({ user: rows[0], token });
});`,
      },
      {
        method: "POST",
        path: "/api/auth/login",
        desc: "Login and receive a JWT token",
        tables: ["users"],
        code: `// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await db.query(
    'SELECT * FROM users WHERE email = $1', [email]
  );

  if (!rows[0]) return res.status(401).json({ error: 'Invalid credentials' });

  // Compare submitted password against stored hash
  const valid = await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: rows[0].id }, process.env.JWT_SECRET);
  res.json({ token, userId: rows[0].id });
});`,
      },
    ],
  },
  {
    group: "Products",
    color: "#10B981",
    items: [
      {
        method: "GET",
        path: "/api/products",
        desc: "List products with filters & pagination",
        tables: ["products", "product_variants", "product_images", "stores"],
        code: `// GET /api/products?category=shoes&page=1&limit=20
app.get('/api/products', async (req, res) => {
  const { category, page = 1, limit = 20, sort = 'created_at' } = req.query;
  const offset = (page - 1) * limit;

  // JOIN across 4 tables — this is where schema design pays off
  const { rows } = await db.query(\`
    SELECT
      p.id, p.name, p.slug, p.base_price, p.status,
      s.name        AS store_name,
      c.name        AS category_name,
      i.url         AS primary_image,
      MIN(v.price)  AS min_price,
      MAX(v.price)  AS max_price,
      SUM(v.stock_qty) AS total_stock
    FROM products p
    JOIN stores s           ON s.id = p.store_id
    LEFT JOIN categories c  ON c.id = p.category_id
    LEFT JOIN product_images i ON i.product_id = p.id AND i.is_primary = true
    LEFT JOIN product_variants v ON v.product_id = p.id
    WHERE p.status = 'active'
      AND ($1::text IS NULL OR c.slug = $1)
    GROUP BY p.id, s.name, c.name, i.url
    ORDER BY p.\${sort} DESC
    LIMIT $2 OFFSET $3
  \`, [category || null, limit, offset]);

  res.json({ products: rows, page: +page, limit: +limit });
});`,
      },
      {
        method: "GET",
        path: "/api/products/:slug",
        desc: "Get a single product with all variants",
        tables: ["products", "product_variants", "variant_attributes", "product_images", "reviews"],
        code: `// GET /api/products/blue-running-shoes
app.get('/api/products/:slug', async (req, res) => {
  // Fetch base product
  const { rows: [product] } = await db.query(
    'SELECT * FROM products WHERE slug = $1 AND status = $2',
    [req.params.slug, 'active']
  );
  if (!product) return res.status(404).json({ error: 'Not found' });

  // Fetch all variants with their attributes in one query
  const { rows: variants } = await db.query(\`
    SELECT v.*,
      json_agg(json_build_object(
        'name',  a.attribute_name,
        'value', a.attribute_value
      )) AS attributes
    FROM product_variants v
    LEFT JOIN variant_attributes a ON a.variant_id = v.id
    WHERE v.product_id = $1
    GROUP BY v.id
  \`, [product.id]);

  // Fetch images and avg rating in parallel (faster!)
  const [images, rating] = await Promise.all([
    db.query('SELECT * FROM product_images WHERE product_id=$1 ORDER BY sort_order', [product.id]),
    db.query('SELECT AVG(rating)::numeric(3,2) AS avg, COUNT(*) AS total FROM reviews WHERE product_id=$1', [product.id])
  ]);

  res.json({ ...product, variants, images: images.rows, rating: rating.rows[0] });
});`,
      },
      {
        method: "POST",
        path: "/api/products",
        desc: "Create a product (seller only)",
        tables: ["products", "product_variants", "stores"],
        code: `// POST /api/products  — requires auth middleware
app.post('/api/products', requireAuth, async (req, res) => {
  const { name, description, base_price, category_id, variants } = req.body;

  // Look up the seller's store
  const { rows: [store] } = await db.query(
    'SELECT id FROM stores WHERE user_id = $1', [req.userId]
  );
  if (!store) return res.status(403).json({ error: 'No store found' });

  const slug = name.toLowerCase().replace(/\\s+/g, '-');

  // Use a transaction — if variant insert fails, product rolls back too
  await db.query('BEGIN');
  try {
    const { rows: [product] } = await db.query(\`
      INSERT INTO products (store_id, category_id, name, slug, description, base_price)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    \`, [store.id, category_id, name, slug, description, base_price]);

    for (const v of variants) {
      await db.query(\`
        INSERT INTO product_variants (product_id, sku, name, price, stock_qty)
        VALUES ($1, $2, $3, $4, $5)
      \`, [product.id, v.sku, v.name, v.price, v.stock_qty]);
    }

    await db.query('COMMIT');
    res.status(201).json(product);
  } catch (err) {
    await db.query('ROLLBACK');  // ← atomic: nothing saved if anything fails
    res.status(500).json({ error: err.message });
  }
});`,
      },
    ],
  },
  {
    group: "Cart",
    color: "#F59E0B",
    items: [
      {
        method: "GET",
        path: "/api/cart",
        desc: "Get the current user's cart",
        tables: ["carts", "cart_items", "product_variants", "products"],
        code: `// GET /api/cart
app.get('/api/cart', requireAuth, async (req, res) => {
  // Get or create cart for this user (upsert pattern)
  const { rows: [cart] } = await db.query(\`
    INSERT INTO carts (user_id) VALUES ($1)
    ON CONFLICT DO NOTHING
    RETURNING *
  \`, [req.userId]);

  const cartId = cart?.id || (await db.query(
    'SELECT id FROM carts WHERE user_id=$1', [req.userId]
  )).rows[0].id;

  // Single query gets everything needed to render the cart UI
  const { rows: items } = await db.query(\`
    SELECT
      ci.id, ci.quantity,
      v.id         AS variant_id,
      v.name       AS variant_name,
      v.price,
      v.stock_qty,
      p.name       AS product_name,
      p.slug       AS product_slug,
      i.url        AS image_url,
      (v.price * ci.quantity) AS line_total
    FROM cart_items ci
    JOIN product_variants v  ON v.id = ci.variant_id
    JOIN products p          ON p.id = v.product_id
    LEFT JOIN product_images i ON i.product_id = p.id AND i.is_primary = true
    WHERE ci.cart_id = $1
  \`, [cartId]);

  const total = items.reduce((sum, i) => sum + parseFloat(i.line_total), 0);
  res.json({ cartId, items, total });
});`,
      },
      {
        method: "POST",
        path: "/api/cart/items",
        desc: "Add or update a cart item",
        tables: ["cart_items", "product_variants"],
        code: `// POST /api/cart/items  { variantId, quantity }
app.post('/api/cart/items', requireAuth, async (req, res) => {
  const { variantId, quantity } = req.body;

  // Check stock before adding
  const { rows: [variant] } = await db.query(
    'SELECT stock_qty FROM product_variants WHERE id=$1', [variantId]
  );
  if (!variant || variant.stock_qty < quantity) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }

  const { rows: [cart] } = await db.query(
    'SELECT id FROM carts WHERE user_id=$1', [req.userId]
  );

  // UPSERT — if item exists, increment qty; otherwise insert fresh
  // This is why we have UNIQUE(cart_id, variant_id) on the table
  const { rows: [item] } = await db.query(\`
    INSERT INTO cart_items (cart_id, variant_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (cart_id, variant_id)
    DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
    RETURNING *
  \`, [cart.id, variantId, quantity]);

  res.status(201).json(item);
});`,
      },
    ],
  },
  {
    group: "Orders",
    color: "#EF4444",
    items: [
      {
        method: "POST",
        path: "/api/orders",
        desc: "Place an order from the cart",
        tables: ["orders", "order_items", "cart_items", "product_variants"],
        code: `// POST /api/orders  { addressId, couponCode? }
app.post('/api/orders', requireAuth, async (req, res) => {
  const { addressId, couponCode } = req.body;

  await db.query('BEGIN');
  try {
    // 1. Fetch cart items with current prices
    const { rows: cartItems } = await db.query(\`
      SELECT ci.quantity, v.id AS variant_id, v.price, v.stock_qty, p.store_id
      FROM cart_items ci
      JOIN product_variants v ON v.id = ci.variant_id
      JOIN products p ON p.id = v.product_id
      WHERE ci.cart_id = (SELECT id FROM carts WHERE user_id=$1)
    \`, [req.userId]);

    if (!cartItems.length) throw new Error('Cart is empty');

    // 2. Validate stock for every item
    for (const item of cartItems) {
      if (item.stock_qty < item.quantity) throw new Error('Item out of stock');
    }

    // 3. Calculate totals
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

    // 4. Create the order (price snapshot happens here)
    const { rows: [order] } = await db.query(\`
      INSERT INTO orders (user_id, shipping_address_id, subtotal, total, status)
      VALUES ($1, $2, $3, $3, 'pending') RETURNING *
    \`, [req.userId, addressId, subtotal]);

    // 5. Insert order_items — price locked at purchase time!
    for (const item of cartItems) {
      await db.query(\`
        INSERT INTO order_items (order_id, variant_id, store_id, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5, $6)
      \`, [order.id, item.variant_id, item.store_id, item.quantity, item.price, item.price * item.quantity]);

      // 6. Decrement stock atomically
      await db.query(
        'UPDATE product_variants SET stock_qty = stock_qty - $1 WHERE id = $2',
        [item.quantity, item.variant_id]
      );
    }

    // 7. Clear the cart
    await db.query(
      'DELETE FROM cart_items WHERE cart_id=(SELECT id FROM carts WHERE user_id=$1)',
      [req.userId]
    );

    await db.query('COMMIT');
    res.status(201).json(order);
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});`,
      },
      {
        method: "GET",
        path: "/api/orders/:id",
        desc: "Get full order details",
        tables: ["orders", "order_items", "payments", "shipments"],
        code: `// GET /api/orders/:id
app.get('/api/orders/:id', requireAuth, async (req, res) => {
  const { rows: [order] } = await db.query(\`
    SELECT o.*, a.line1, a.city, a.country
    FROM orders o
    LEFT JOIN addresses a ON a.id = o.shipping_address_id
    WHERE o.id = $1 AND o.user_id = $2
  \`, [req.params.id, req.userId]);

  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Fetch related data in parallel
  const [items, payment, shipment] = await Promise.all([
    db.query(\`
      SELECT oi.*, p.name AS product_name, v.name AS variant_name, i.url AS image
      FROM order_items oi
      JOIN product_variants v ON v.id = oi.variant_id
      JOIN products p ON p.id = v.product_id
      LEFT JOIN product_images i ON i.product_id = p.id AND i.is_primary = true
      WHERE oi.order_id = $1
    \`, [order.id]),
    db.query('SELECT * FROM payments WHERE order_id=$1', [order.id]),
    db.query('SELECT * FROM shipments WHERE order_id=$1', [order.id]),
  ]);

  res.json({
    ...order,
    items: items.rows,
    payment: payment.rows[0] || null,
    shipment: shipment.rows[0] || null,
  });
});`,
      },
    ],
  },
];
