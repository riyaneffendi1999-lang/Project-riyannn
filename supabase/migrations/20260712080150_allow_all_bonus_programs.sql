-- Drop old check constraint if exists, allow all 4 programs
ALTER TABLE bonus_tasks DROP CONSTRAINT IF EXISTS bonus_tasks_program_check;
ALTER TABLE bonus_tasks ADD CONSTRAINT bonus_tasks_program_check
  CHECK (program IN ('lucky-spin','kamis-ceria','gebyar-turnover','slot-race'));