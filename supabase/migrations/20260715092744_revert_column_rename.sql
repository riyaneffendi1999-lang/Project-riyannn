-- Revert: drop account_type, restore type column
ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS bank_accts_atype_ck;
ALTER TABLE bank_accounts DROP COLUMN IF EXISTS account_type;
ALTER TABLE bank_accounts ADD COLUMN type text NOT NULL DEFAULT 'Bank Transfer';
ALTER TABLE bank_accounts ADD CONSTRAINT bank_accts_type_ck2 CHECK (LOWER(type) IN ('bank transfer', 'e-money', 'pulsa'));
