-- Drop the type column and recreate with a new name to bypass PostgREST cache
ALTER TABLE bank_accounts DROP COLUMN type;
ALTER TABLE bank_accounts ADD COLUMN account_type text NOT NULL DEFAULT 'Bank Transfer';

-- Add constraint on the new column
ALTER TABLE bank_accounts ADD CONSTRAINT bank_accts_atype_ck CHECK (LOWER(account_type) IN ('bank transfer', 'e-money', 'pulsa'));
