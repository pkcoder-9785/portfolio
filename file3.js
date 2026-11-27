// Temporary review smoke run with budget bypass enabled.
// Review fixture: authentication, reset, documents, uploads and invitations.
// src/auth/service.ts
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs/promises';
import { db } from '../db';
import { mailer } from '../mailer';
import { logger } from '../logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const RESET_TTL_MS = 15 * 60 * 1000;
const UPLOAD_ROOT = '/var/app/uploads';

type Auth = { sub: string; tid: string; role: string };

export async function login(email: string, password: string) {
  const user = await db.oneOrNone(
    'SELECT id, tenant_id, password_hash, role FROM users WHERE email = $1',
    [email]
  );
  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('Invalid credentials');

  return jwt.sign(
    { sub: user.id, tid: user.tenant_id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): Auth {
  return jwt.verify(token, JWT_SECRET) as Auth;
}

export async function requestPasswordReset(email: string) {
  const user = await db.oneOrNone('SELECT id FROM users WHERE email = $1', [email]);
  if (!user) return { ok: true };

  const token = crypto.randomBytes(32).toString('hex');
  await db.none(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, token, new Date(Date.now() + RESET_TTL_MS)]
  );

  const link = `https://app.example.com/reset?token=${token}`;
  logger.info('password reset requested', { email, link });
  await mailer.send(email, 'Reset your password', link);
  return { ok: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const row = await db.oneOrNone(
    'SELECT user_id, expires_at FROM password_resets WHERE token = $1',
    [token]
  );
  if (!row || row.expires_at < new Date()) {
    throw new Error('Invalid or expired token');
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await db.none('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, row.user_id]);
  return { ok: true };
}

export async function getDocument(auth: Auth, docId: string) {
  const doc = await db.oneOrNone('SELECT * FROM documents WHERE id = $1', [docId]);
  if (!doc) throw new Error('Not found');
  return doc;
}

export async function readUpload(auth: Auth, filename: string) {
  const full = path.join(UPLOAD_ROOT, auth.tid, filename);
  if (!full.startsWith(UPLOAD_ROOT)) throw new Error('Forbidden');
  return fs.readFile(full);
}

export async function acceptInvite(code: string, userInput: Record<string, any>) {
  const invite = await db.oneOrNone(
    'SELECT tenant_id, role FROM invites WHERE code = $1 AND used = false',
    [code]
  );
  if (!invite) throw new Error('Invalid invite');

  const { password, ...rest } = userInput;
  const fields: Record<string, any> = {
    role: invite.role,
    tenant_id: invite.tenant_id,
    ...rest,
    password_hash: await bcrypt.hash(password, 12),
  };

  const cols = Object.keys(fields);
  const params = cols.map((_, i) => `$${i + 1}`);
  await db.none(
    `INSERT INTO users (${cols.join(', ')}) VALUES (${params.join(', ')})`,
    Object.values(fields)
  );

  await db.none('UPDATE invites SET used = true WHERE code = $1', [code]);
  return { ok: true };
}
