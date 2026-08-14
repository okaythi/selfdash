import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const logs = sqliteTable('logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp').notNull(),
  action_type: text('action_type').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull(),
});

export const state = sqliteTable('state', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updated_at: integer('updated_at').notNull(),
});

export const commands_queue = sqliteTable('commands_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  created_at: integer('created_at').notNull(),
  command: text('command').notNull(), // JSON payload of the command
  status: text('status').notNull(), // 'pending', 'executed', 'failed'
});
