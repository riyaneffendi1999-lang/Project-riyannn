-- Drop and recreate bank_accounts table to force PostgREST schema cache refresh
DROP TABLE IF EXISTS bank_accounts CASCADE;

CREATE TABLE bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  account_number text NOT NULL,
  holder_name text NOT NULL,
  type text NOT NULL DEFAULT 'Bank Transfer',
  status text NOT NULL DEFAULT 'active',
  initial_balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bank_accts_type_ck CHECK (LOWER(type) IN ('bank transfer', 'e-money', 'pulsa')),
  CONSTRAINT bank_accts_status_ck CHECK (status IN ('active', 'inactive'))
);

-- Enable RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies for anon + authenticated
CREATE POLICY "anon_select_bank_accounts" ON bank_accounts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_bank_accounts" ON bank_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_bank_accounts" ON bank_accounts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_bank_accounts" ON bank_accounts FOR DELETE TO anon, authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bank_accounts;
