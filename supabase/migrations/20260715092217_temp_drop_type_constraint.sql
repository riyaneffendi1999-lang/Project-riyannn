-- Drop the type check constraint entirely to test if PostgREST cache is the issue
ALTER TABLE bank_accounts
  DROP CONSTRAINT IF EXISTS bank_accounts_type_check;
