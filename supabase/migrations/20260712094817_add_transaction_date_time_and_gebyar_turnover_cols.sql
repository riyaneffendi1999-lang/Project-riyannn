/*
# Add transaction_date, transaction_time to transactions; total_turnover, prize to bonus_tasks

1. transactions table changes
   - Add `transaction_date` (date) — optional date the deposit occurred
   - Add `transaction_time` (time) — optional time the deposit occurred

2. bonus_tasks table changes
   - Add `total_turnover` (numeric) — total turnover for gebyar-turnover program
   - Add `prize` (text) — prize description (can be cash or barang/goods)

3. Security
   - No RLS policy changes — existing policies remain intact.
   - All new columns have safe defaults so existing rows are unaffected.
*/

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS transaction_date date,
  ADD COLUMN IF NOT EXISTS transaction_time time;

ALTER TABLE bonus_tasks
  ADD COLUMN IF NOT EXISTS total_turnover numeric(15,0) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prize text NOT NULL DEFAULT '';
