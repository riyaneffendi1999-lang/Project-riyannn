-- Drop the view first
DROP VIEW IF EXISTS bank_accounts_view;

-- Drop all constraints on type column
ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS bank_accts_type_ck2;
ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS bank_accts_type_ck;

-- The type column is already text, just remove constraints
-- No need to alter type
