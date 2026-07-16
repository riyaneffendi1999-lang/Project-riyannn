-- Force PostgREST schema cache refresh by altering the column type
ALTER TABLE bank_accounts ALTER COLUMN type TYPE text;
