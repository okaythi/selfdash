CREATE TABLE IF NOT EXISTS `logs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `timestamp` integer NOT NULL,
  `action_type` text NOT NULL,
  `description` text NOT NULL,
  `status` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `state` (
  `key` text PRIMARY KEY NOT NULL,
  `value` text NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `commands_queue` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `created_at` integer NOT NULL,
  `command` text NOT NULL,
  `status` text NOT NULL
);
