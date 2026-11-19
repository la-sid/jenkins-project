const request = require('supertest');
const app = require('../src/app');

describe('Ecommerce API', () => {
  test('health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('lists products', async () => {
    const res = await request(app).get('/products');
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('returns 404 for unknown product', async () => {
    const res = await request(app).get('/products/999');
    expect(res.statusCode).toBe(404);
  });

  test('add to cart then checkout', async () => {
    await request(app).post('/cart/u1').send({ productId: 1, qty: 2 }).expect(201);
    const res = await request(app).post('/checkout/u1');
    expect(res.statusCode).toBe(201);
    expect(res.body.total).toBe(3998);
  });

  test('checkout with empty cart fails', async () => {
    const res = await request(app).post('/checkout/nobody');
    expect(res.statusCode).toBe(400);
  });

  test('rejects invalid quantity', async () => {
    const res = await request(app).post('/cart/u2').send({ productId: 1, qty: 9999 });
    expect(res.statusCode).toBe(400);
  });
});
