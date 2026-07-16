/*
# Admin Panel — Core Tables

Creates four tables used by the admin data-recap panel:

1. `transactions`  — deposit records (Bank & E-Money channels)
   - id, user_name, method, amount (numeric), status, note, created_at

2. `bonus_entries` — bonus program participation records
   - id, program, user_name, prize, points, status, created_at

3. `managed_users` — platform user accounts managed by admins
   - id, name, email, role, status, joined_at, created_at

4. `bank_accounts`  — bank / e-money accounts used for deposit routing
   - id, name, code, account_number, holder_name, type, status, created_at

Security:
- RLS enabled on all four tables.
- All policies scoped TO authenticated (admin must be signed in).
- Admins have full CRUD on every table.
*/

-- ─── transactions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name    text NOT NULL,
  method       text NOT NULL CHECK (method IN ('BCA','Mandiri','BNI','BRI','DANA','OVO','GOPAY','LINKAJA','PULSA')),
  amount       numeric(15,0) NOT NULL CHECK (amount > 0),
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('success','pending','failed')),
  note         text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_transactions" ON transactions;
CREATE POLICY "auth_select_transactions" ON transactions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_transactions" ON transactions;
CREATE POLICY "auth_insert_transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_transactions" ON transactions;
CREATE POLICY "auth_update_transactions" ON transactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_transactions" ON transactions;
CREATE POLICY "auth_delete_transactions" ON transactions FOR DELETE TO authenticated USING (true);

-- ─── bonus_entries ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bonus_entries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program      text NOT NULL CHECK (program IN ('lucky-spin','kamis-ceria','gebyar-turnover','slot-race')),
  user_name    text NOT NULL,
  prize        text NOT NULL,
  points       integer NOT NULL DEFAULT 0,
  status       text NOT NULL DEFAULT 'unclaimed' CHECK (status IN ('claimed','unclaimed')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bonus_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_bonus_entries" ON bonus_entries;
CREATE POLICY "auth_select_bonus_entries" ON bonus_entries FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_bonus_entries" ON bonus_entries;
CREATE POLICY "auth_insert_bonus_entries" ON bonus_entries FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_bonus_entries" ON bonus_entries;
CREATE POLICY "auth_update_bonus_entries" ON bonus_entries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_bonus_entries" ON bonus_entries;
CREATE POLICY "auth_delete_bonus_entries" ON bonus_entries FOR DELETE TO authenticated USING (true);

-- ─── managed_users ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS managed_users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  email        text NOT NULL UNIQUE,
  role         text NOT NULL DEFAULT 'Viewer' CHECK (role IN ('Admin','Operator','Viewer')),
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  joined_at    date NOT NULL DEFAULT CURRENT_DATE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE managed_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_managed_users" ON managed_users;
CREATE POLICY "auth_select_managed_users" ON managed_users FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_managed_users" ON managed_users;
CREATE POLICY "auth_insert_managed_users" ON managed_users FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_managed_users" ON managed_users;
CREATE POLICY "auth_update_managed_users" ON managed_users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_managed_users" ON managed_users;
CREATE POLICY "auth_delete_managed_users" ON managed_users FOR DELETE TO authenticated USING (true);

-- ─── bank_accounts ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bank_accounts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  code           text NOT NULL,
  account_number text NOT NULL,
  holder_name    text NOT NULL,
  type           text NOT NULL CHECK (type IN ('Bank Transfer','E-Money','Pulsa')),
  status         text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_bank_accounts" ON bank_accounts;
CREATE POLICY "auth_select_bank_accounts" ON bank_accounts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_bank_accounts" ON bank_accounts;
CREATE POLICY "auth_insert_bank_accounts" ON bank_accounts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_bank_accounts" ON bank_accounts;
CREATE POLICY "auth_update_bank_accounts" ON bank_accounts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_bank_accounts" ON bank_accounts;
CREATE POLICY "auth_delete_bank_accounts" ON bank_accounts FOR DELETE TO authenticated USING (true);
