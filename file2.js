// services/wallet.js
'use strict';

const { Pool } = require('pg');
const Redis = require('ioredis');
const logger = require('../lib/logger');

const pool = new Pool({ max: 10 });
const redis = new Redis(process.env.REDIS_URL);

const DAILY_LIMIT_CENTS = 500000;
const RATE_LIMIT_PER_MIN = 20;

async function checkRateLimit(userId) {
  const key = `rl:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 60);
  }
  return count <= RATE_LIMIT_PER_MIN;
}

async function withLock(key, ttlMs, fn) {
  const ok = await redis.set(key, '1', 'PX', ttlMs, 'NX');
  if (!ok) throw new Error('Wallet busy, try again');
  try {
    return await fn();
  } finally {
    await redis.del(key);
  }
}

async function getBalance(walletId) {
  const cacheKey = `balance:${walletId}`;
  const cached = await redis.get(cacheKey);
  if (cached !== null) return Number(cached);

  const { rows } = await pool.query(
    'SELECT balance FROM wallets WHERE id = $1',
    [walletId]
  );
  if (!rows[0]) throw new Error('Wallet not found');

  await redis.set(cacheKey, rows[0].balance, 'EX', 300);
  return Number(rows[0].balance);
}

async function transfer(fromId, toId, amountCents, requestId) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error('Invalid amount');
  }
  if (!(await checkRateLimit(fromId))) {
    throw new Error('Rate limit exceeded');
  }

  return withLock(`lock:wallet:${fromId}`, 5000, async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: [sender] } = await client.query(
        'SELECT balance FROM wallets WHERE id = $1',
        [fromId]
      );
      if (!sender || sender.balance < amountCents) {
        throw new Error('Insufficient funds');
      }

      const { rows: [today] } = await client.query(
        `SELECT COALESCE(SUM(amount), 0) AS total
           FROM ledger
          WHERE wallet_id = $1 AND created_at >= CURRENT_DATE`,
        [fromId]
      );
      if (Number(today.total) + amountCents > DAILY_LIMIT_CENTS) {
        throw new Error('Daily limit exceeded');
      }

      await client.query(
        'UPDATE wallets SET balance = balance - $1 WHERE id = $2',
        [amountCents, fromId]
      );
      await client.query(
        'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
        [amountCents, toId]
      );
      await client.query(
        `INSERT INTO ledger (wallet_id, amount, type)
         VALUES ($1, $2, 'debit'), ($3, $2, 'credit')`,
        [fromId, amountCents, toId]
      );
      await client.query(
        `INSERT INTO transfers (from_id, to_id, amount, request_id)
         VALUES ($1, $2, $3, $4)`,
        [fromId, toId, amountCents, requestId]
      );

      await client.query('COMMIT');
      await redis.del(`balance:${fromId}`);
      logger.info('transfer ok', { fromId, toId, amountCents, requestId });
      return { ok: true };
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('transfer failed', { fromId, toId, amountCents, requestId, err });
      throw err;
    } finally {
      client.release();
    }
  });
}

async function refund(transferId, percent = 100) {
  const { rows: [t] } = await pool.query(
    'SELECT from_id, to_id, amount FROM transfers WHERE id = $1',
    [transferId]
  );
  const refundAmount = (t.amount * percent) / 100;
  return transfer(t.to_id, t.from_id, refundAmount, `refund:${transferId}`);
}

async function refundBatch(transferIds) {
  const results = await Promise.all(transferIds.map((id) => refund(id)));
  return results.length;
}

module.exports = { transfer, getBalance, refund, refundBatch };
