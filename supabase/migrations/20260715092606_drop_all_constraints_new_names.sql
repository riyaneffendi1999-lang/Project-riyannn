-- Drop ALL check constraints on bank_accounts
ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS bank_accounts_type_check;
ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS bank_accounts_type_chk;
ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS bank_accounts_status_check;

-- Recreate with new names
ALTER TABLE bank_accounts ADD CONSTRAINT bank_accts_type_ck CHECK (LOWER(type) IN ('bank transfer', 'e-money', 'pulsa'));
ALTER TABLE bank_accounts ADD CONSTRAINT bank_accts_status_ck CHECK (status IN ('active', 'inactive'));
