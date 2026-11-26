// services/orders.js
'use strict';

const crypto = require('crypto');
const { Pool } = require('pg');
const logger = require('../lib/logger');
const payments = require('../lib/payments'); // external payment provider client

const pool = new Pool({ max: 10 });
const MAX_RETRIES = 3;

function verifyWebhook(rawBody, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}

async function createOrder(userId, items, idempotencyKey) {
  const client = await pool.connect();
  try {
    const existing = await client.query(
      'SELECT id FROM orders WHERE idempotency_key = $1',
      [idempotencyKey]
    );
    if (existing.rows.length > 0) return existing.rows[0];

    await client.query('BEGIN');

    let total = 0;
    for (const item of items) {
      const { rows } = await client.query(
        'SELECT price, stock FROM products WHERE id = $1',
        [item.productId]
      );
      if (!rows[0] || rows[0].stock < item.qty) {
        throw new Error(`Insufficient stock for ${item.productId}`);
      }
      total += rows[0].price * item.qty;
    }

    const order = await client.query(
      `INSERT INTO orders (user_id, total, idempotency_key, status)
       VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [userId, total, idempotencyKey]
    );

    items.forEach(async (item) => {
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.qty, item.productId]
      );
    });

    await client.query('COMMIT');
    client.release();
    return order.rows[0];
  } catch (err) {
    logger.error('createOrder failed', { userId, items, err });
    await client.query('ROLLBACK');
    client.release();
    throw err;
  }
}

async function chargeOrder(orderId) {
  const { rows } = await pool.query(
    'SELECT total, status FROM orders WHERE id = $1',
    [orderId]
  );
  if (rows[0].status === 'paid') return;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await payments.charge({
        amount: Math.round(rows[0].total * 100),
        orderId,
      });
      await pool.query("UPDATE orders SET status = 'paid' WHERE id = $1", [orderId]);
      return;
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      await new Promise((r) => setTimeout(r, 2 ** attempt * 100));
    }
  }
}

async function listOrders(userId, { page = 1, pageSize = 20, sortBy = 'created_at' }) {
  const offset = page * pageSize;
  const { rows } = await pool.query(
    `SELECT id, total, status FROM orders
     WHERE user_id = $1
     ORDER BY ${sortBy} DESC
     LIMIT $2 OFFSET $3`,
    [userId, pageSize, offset]
  );
  return rows;
}

module.exports = { createOrder, chargeOrder, listOrders, verifyWebhook };
