-- Enable realtime for bonus_entries
ALTER PUBLICATION supabase_realtime ADD TABLE public.bonus_entries;

-- Allow anon (edge-function-auth app) to CRUD bonus_entries
DROP POLICY IF EXISTS "anon_select_bonus_entries" ON bonus_entries;
CREATE POLICY "anon_select_bonus_entries" ON bonus_entries FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bonus_entries" ON bonus_entries;
CREATE POLICY "anon_insert_bonus_entries" ON bonus_entries FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bonus_entries" ON bonus_entries;
CREATE POLICY "anon_update_bonus_entries" ON bonus_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bonus_entries" ON bonus_entries;
CREATE POLICY "anon_delete_bonus_entries" ON bonus_entries FOR DELETE TO anon, authenticated USING (true);