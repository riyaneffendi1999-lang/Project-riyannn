-- Tambah saldo awal ke bank_accounts
ALTER TABLE bank_accounts
  ADD COLUMN IF NOT EXISTS initial_balance numeric NOT NULL DEFAULT 0;

-- Tambah referensi rekening ke transactions
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS bank_account_id uuid REFERENCES bank_accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS bank_name text NOT NULL DEFAULT '';
