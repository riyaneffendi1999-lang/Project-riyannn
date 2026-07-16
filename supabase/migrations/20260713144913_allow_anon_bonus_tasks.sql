-- Allow anon (edge-function-auth app) to CRUD bonus_tasks
DROP POLICY IF EXISTS "anon_select_bonus_tasks" ON bonus_tasks;
CREATE POLICY "anon_select_bonus_tasks" ON bonus_tasks FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bonus_tasks" ON bonus_tasks;
CREATE POLICY "anon_insert_bonus_tasks" ON bonus_tasks FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bonus_tasks" ON bonus_tasks;
CREATE POLICY "anon_update_bonus_tasks" ON bonus_tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bonus_tasks" ON bonus_tasks;
CREATE POLICY "anon_delete_bonus_tasks" ON bonus_tasks FOR DELETE TO anon, authenticated USING (true);