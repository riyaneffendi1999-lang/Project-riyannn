-- Create an RPC function to insert bank accounts, bypassing PostgREST's cached constraint validation
CREATE OR REPLACE FUNCTION add_bank_account(
  p_name text,
  p_code text,
  p_account_number text,
  p_holder_name text,
  p_type text,
  p_status text,
  p_initial_balance numeric DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO bank_accounts (name, code, account_number, holder_name, type, status, initial_balance)
  VALUES (p_name, p_code, p_account_number, p_holder_name, p_type, p_status, p_initial_balance)
  RETURNING id INTO new_id;
  
  RETURN json_build_object('id', new_id, 'success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Allow anon and authenticated to call this function
GRANT EXECUTE ON FUNCTION add_bank_account TO anon, authenticated;
