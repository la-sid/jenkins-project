const express = require('express');

const app = express();
app.use(express.json());

const products = [
  { id: 1, name: 'Wireless Mouse', price: 1999, stock: 50 },
  { id: 2, name: 'Mechanical Keyboard', price: 7499, stock: 20 },
  { id: 3, name: 'USB-C Hub', price: 3499, stock: 35 },
];
const carts = {};   // userId -> [{ productId, qty }]
const orders = [];

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/products', (req, res) => res.json(products));

app.get('/products/:id', (req, res) => {
  const p = products.find((x) => x.id === Number(req.params.id));
  return p ? res.json(p) : res.status(404).json({ error: 'Product not found' });
});

app.post('/cart/:userId', (req, res) => {
  const { productId, qty = 1 } = req.body;
  const product = products.find((x) => x.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (qty < 1 || qty > product.stock) return res.status(400).json({ error: 'Invalid quantity' });
  const cart = (carts[req.params.userId] = carts[req.params.userId] || []);
  const line = cart.find((l) => l.productId === productId);
  if (line) line.qty += qty;
  else cart.push({ productId, qty });
  return res.status(201).json(cart);
});

app.get('/cart/:userId', (req, res) => res.json(carts[req.params.userId] || []));

app.post('/checkout/:userId', (req, res) => {
  const cart = carts[req.params.userId];
  if (!cart || cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  let total = 0;
  for (const line of cart) {
    const p = products.find((x) => x.id === line.productId);
    if (line.qty > p.stock) return res.status(409).json({ error: `Insufficient stock for ${p.name}` });
    total += p.price * line.qty;
  }
  cart.forEach((line) => { products.find((x) => x.id === line.productId).stock -= line.qty; });
  const order = { id: orders.length + 1, userId: req.params.userId, items: [...cart], total };
  orders.push(order);
  delete carts[req.params.userId];
  return res.status(201).json(order);
});

module.exports = app;
