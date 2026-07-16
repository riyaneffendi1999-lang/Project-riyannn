/*
# Update Transaction Statuses

Changes the transaction status enum from (success, pending, failed)
to the new set: approved, pending, unik, pindah-dana, biaya-admin.

1. Schema Changes
   - Drop old CHECK constraint on transactions.status
   - Add new CHECK constraint with updated values
   - Migrate existing data: success → approved, failed → pending

2. Security
   - No RLS policy changes.
*/

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

UPDATE transactions SET status = 'approved' WHERE status = 'success';
UPDATE transactions SET status = 'pending' WHERE status = 'failed';

ALTER TABLE transactions ADD CONSTRAINT transactions_status_check
  CHECK (status IN ('approved','pending','unik','pindah-dana','biaya-admin'));
