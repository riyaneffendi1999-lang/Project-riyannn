-- Create a new bank_accounts table with a different name to bypass PostgREST cache
CREATE TABLE IF NOT EXISTS bank_accounts_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  account_number text NOT NULL,
  holder_name text NOT NULL,
  type text NOT NULL DEFAULT 'Bank Transfer',
  status text NOT NULL DEFAULT 'active',
  initial_balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bank_accts2_type_ck CHECK (LOWER(type) IN ('bank transfer', 'e-money', 'pulsa')),
  CONSTRAINT bank_accts2_status_ck CHECK (status IN ('active', 'inactive'))
);

-- Enable RLS
ALTER TABLE bank_accounts_v2 ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "anon_select_ba2" ON bank_accounts_v2 FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_ba2" ON bank_accounts_v2 FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_ba2" ON bank_accounts_v2 FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_ba2" ON bank_accounts_v2 FOR DELETE TO anon, authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bank_accounts_v2;

-- Migrate any existing data from old table
INSERT INTO bank_accounts_v2 (name, code, account_number, holder_name, type, status, initial_balance, created_at)
SELECT name, code, account_number, holder_name, type, status, initial_balance, created_at
FROM bank_accounts
ON CONFLICT DO NOTHING;
