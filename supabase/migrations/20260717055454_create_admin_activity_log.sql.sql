/*
# Create admin_activity_log table for login/logout notifications

1. New Tables
- `admin_activity_log`
  - `id` (uuid, primary key)
  - `user_id` (uuid, the admin's auth.users id, defaults to auth.uid())
  - `username` (text, the admin's username for display)
  - `email` (text, the admin's email)
  - `action` (text: 'login' or 'logout')
  - `created_at` (timestamptz, defaults to now())

2. Security
- Enable RLS on `admin_activity_log`.
- SELECT: all authenticated admins can see all activity (shared admin panel data).
- INSERT: authenticated admins can insert their own logout records.
  Login records are inserted by the auth-login edge function using the service role key (bypasses RLS).

3. Realtime
- Enable realtime on `admin_activity_log` so the Topbar notification bell updates live.
*/

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  username text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  action text NOT NULL CHECK (action IN ('login', 'logout')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_admin_activity_log" ON admin_activity_log;
CREATE POLICY "select_admin_activity_log"
ON admin_activity_log FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_activity_log" ON admin_activity_log;
CREATE POLICY "insert_own_activity_log"
ON admin_activity_log FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER TABLE admin_activity_log REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'admin_activity_log'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE admin_activity_log;
  END IF;
END $$;
