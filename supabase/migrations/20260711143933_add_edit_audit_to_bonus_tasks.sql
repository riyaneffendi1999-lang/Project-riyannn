ALTER TABLE bonus_tasks
  ADD COLUMN IF NOT EXISTS edited_at  timestamptz,
  ADD COLUMN IF NOT EXISTS edited_by  text;
