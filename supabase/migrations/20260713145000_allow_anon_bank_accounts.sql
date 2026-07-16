-- Allow anon (edge-function-auth app) to CRUD bank_accounts
DROP POLICY IF EXISTS "anon_select_bank_accounts" ON bank_accounts;
CREATE POLICY "anon_select_bank_accounts" ON bank_accounts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bank_accounts" ON bank_accounts;
CREATE POLICY "anon_insert_bank_accounts" ON bank_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bank_accounts" ON bank_accounts;
CREATE POLICY "anon_update_bank_accounts" ON bank_accounts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bank_accounts" ON bank_accounts;
CREATE POLICY "anon_delete_bank_accounts" ON bank_accounts FOR DELETE TO anon, authenticated USING (true);