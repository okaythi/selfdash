import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { state, commands_queue, logs } from '../../src/db/schema'
import { eq } from 'drizzle-orm'
import { sign, verify } from 'hono/jwt'
import { setCookie, getCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database
  APPLICATION_ID: string
  DISCORD_CLIENT_SECRET: string
  JWT_SECRET: string
  API_TOKEN: string
}

const app = new Hono<{ Bindings: Bindings }>()

const ADMIN_DISCORD_ID = '1339570380943261697';

app.get('/api/auth/login', (c) => {
  const redirectUri = `${new URL(c.req.url).origin}/api/auth/callback`;
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${c.env.APPLICATION_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
  return c.redirect(discordAuthUrl);
});

app.get('/api/auth/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) return c.json({ error: 'No code provided' }, 400);

  const redirectUri = `${new URL(c.req.url).origin}/api/auth/callback`;

  const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: c.env.APPLICATION_ID,
      client_secret: c.env.DISCORD_CLIENT_SECRET || '',
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    })
  });

  if (!tokenResponse.ok) return c.json({ error: 'Failed to exchange token' }, 400);
  const tokenData = await tokenResponse.json();

  const userResponse = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });

  if (!userResponse.ok) return c.json({ error: 'Failed to fetch user info' }, 400);
  const userData = await userResponse.json();

  if (userData.id !== ADMIN_DISCORD_ID) {
    return c.json({ error: 'Unauthorized user. Go away.' }, 403);
  }

  const payload = {
    id: userData.id,
    username: userData.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
  };
  
  const token = await sign(payload, c.env.JWT_SECRET || 'fallback_secret_change_me');

  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24,
    path: '/'
  });

  return c.redirect('/');
});

app.get('/api/auth/me', async (c) => {
  const token = getCookie(c, 'session');
  if (!token) return c.json({ user: null }, 401);
  try {
    const decoded = await verify(token, c.env.JWT_SECRET || 'fallback_secret_change_me');
    return c.json({ user: decoded });
  } catch (e) {
    return c.json({ user: null }, 401);
  }
});

app.get('/api/auth/logout', (c) => {
  setCookie(c, 'session', '', { maxAge: 0, path: '/' });
  return c.json({ success: true });
});

const dashboardAuth = async (c: any, next: any) => {
  const token = getCookie(c, 'session');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const decoded = await verify(token, c.env.JWT_SECRET || 'fallback_secret_change_me');
    if (decoded.id !== ADMIN_DISCORD_ID) throw new Error('Invalid ID');
    await next();
  } catch (e) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
}

const botAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const expectedToken = c.env.API_TOKEN || c.env.TOKEN || 'SUPER_SECRET_TOKEN';
  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return c.json({ error: 'Unauthorized bot token' }, 401);
  }
  await next();
}

app.get('/api/state', dashboardAuth, async (c) => {
  const db = drizzle(c.env.DB)
  const allState = await db.select().from(state).all()
  return c.json(allState)
})

app.post('/api/queue-command', dashboardAuth, async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()

  if (!body.command) return c.json({ error: 'Missing command' }, 400)

  const now = Math.floor(Date.now() / 1000)
  await db.insert(commands_queue).values({
    created_at: now,
    command: JSON.stringify(body.command),
    status: 'pending'
  }).run()

  return c.json({ success: true })
})

app.post('/api/push-state', botAuth, async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  
  if (!Array.isArray(body)) return c.json({ error: 'Expected array of {key, value}' }, 400)

  const now = Math.floor(Date.now() / 1000)
  for (const item of body) {
    const { key, value } = item
    if (key && value !== undefined) {
      await db.insert(state)
        .values({ key, value: JSON.stringify(value), updated_at: now })
        .onConflictDoUpdate({ target: state.key, set: { value: JSON.stringify(value), updated_at: now } })
        .run()
    }
  }
  return c.json({ success: true })
})

app.get('/api/poll-commands', botAuth, async (c) => {
  const db = drizzle(c.env.DB)
  const pending = await db.select().from(commands_queue)
    .where(eq(commands_queue.status, 'pending'))
    .limit(10)
    .all()

  if (pending.length > 0) {
    for (const cmd of pending) {
      await db.update(commands_queue)
        .set({ status: 'executing' })
        .where(eq(commands_queue.id, cmd.id))
        .run()
    }
  }

  return c.json({ commands: pending })
})

import { handle } from 'hono/cloudflare-pages'

export const onRequest = handle(app)
