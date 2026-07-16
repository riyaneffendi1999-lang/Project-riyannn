/*
# Add bonus_tasks table

1. New Table: `bonus_tasks`
   - Stores per-row input data for Lucky Spin and Kamis Ceria bonus pages.
   - Columns:
     - id (uuid, primary key)
     - program (text) — 'lucky-spin' or 'kamis-ceria'
     - ticket (text) — ticket number; required for lucky-spin, empty for kamis-ceria
     - user_name (text) — manually typed username
     - inject_bonus (numeric) — manually typed inject/bonus amount
     - status (text) — 'pending' or 'complete'
     - created_at (timestamptz)

2. Security
   - RLS enabled.
   - Full CRUD for authenticated users (admins).
*/

CREATE TABLE IF NOT EXISTS bonus_tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program      text NOT NULL CHECK (program IN ('lucky-spin','kamis-ceria')),
  ticket       text NOT NULL DEFAULT '',
  user_name    text NOT NULL DEFAULT '',
  inject_bonus numeric(15,0) NOT NULL DEFAULT 0,
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','complete')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bonus_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_bonus_tasks" ON bonus_tasks;
CREATE POLICY "auth_select_bonus_tasks" ON bonus_tasks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_bonus_tasks" ON bonus_tasks;
CREATE POLICY "auth_insert_bonus_tasks" ON bonus_tasks FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_bonus_tasks" ON bonus_tasks;
CREATE POLICY "auth_update_bonus_tasks" ON bonus_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_bonus_tasks" ON bonus_tasks;
CREATE POLICY "auth_delete_bonus_tasks" ON bonus_tasks FOR DELETE TO authenticated USING (true);
