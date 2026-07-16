-- Create a view that wraps bank_accounts for inserts
-- PostgREST might use a different cached plan for views
CREATE OR REPLACE VIEW bank_accounts_view AS
SELECT * FROM bank_accounts;

-- Allow anon/authenticated to access the view
GRANT SELECT, INSERT, UPDATE, DELETE ON bank_accounts_view TO anon, authenticated;
