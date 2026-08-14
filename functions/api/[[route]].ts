import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { state, commands_queue, logs } from '../../src/db/schema'
import { eq } from 'drizzle-orm'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Fetch current state
app.get('/api/state', async (c) => {
  const db = drizzle(c.env.DB)
  const allState = await db.select().from(state).all()
  return c.json(allState)
})

// Push new state (called by Python bot)
app.post('/api/push-state', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  
  if (!Array.isArray(body)) {
    return c.json({ error: 'Expected array of {key, value}' }, 400)
  }

  const now = Math.floor(Date.now() / 1000)
  
  for (const item of body) {
    const { key, value } = item
    if (key && value !== undefined) {
      // Upsert using raw SQL or Drizzle onConflictDoUpdate
      await db.insert(state)
        .values({ key, value: JSON.stringify(value), updated_at: now })
        .onConflictDoUpdate({ target: state.key, set: { value: JSON.stringify(value), updated_at: now } })
        .run()
    }
  }

  return c.json({ success: true })
})

// Poll commands (called by Python bot every 1.89s)
app.get('/api/poll-commands', async (c) => {
  const db = drizzle(c.env.DB)
  
  // Get oldest pending command
  const pending = await db.select().from(commands_queue)
    .where(eq(commands_queue.status, 'pending'))
    .limit(10)
    .all()

  if (pending.length > 0) {
    // Mark them as executing
    for (const cmd of pending) {
      await db.update(commands_queue)
        .set({ status: 'executing' })
        .where(eq(commands_queue.id, cmd.id))
        .run()
    }
  }

  return c.json({ commands: pending })
})

// Queue command (called by React frontend)
app.post('/api/queue-command', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()

  if (!body.command) {
    return c.json({ error: 'Missing command' }, 400)
  }

  const now = Math.floor(Date.now() / 1000)
  const result = await db.insert(commands_queue)
    .values({
      created_at: now,
      command: JSON.stringify(body.command),
      status: 'pending'
    })
    .run()

  // Log the action
  await db.insert(logs).values({
    timestamp: now,
    action_type: 'queue_command',
    description: `Queued command: ${JSON.stringify(body.command)}`,
    status: 'success'
  }).run()

  return c.json({ success: true })
})

export default app
