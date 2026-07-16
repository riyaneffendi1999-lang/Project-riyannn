-- Recreate type check constraint with a new name to bust PostgREST cache
ALTER TABLE bank_accounts
  DROP CONSTRAINT IF EXISTS bank_accounts_type_check;

ALTER TABLE bank_accounts
  ADD CONSTRAINT bank_accounts_type_chk
  CHECK (LOWER(type) IN ('bank transfer', 'e-money', 'pulsa'));
