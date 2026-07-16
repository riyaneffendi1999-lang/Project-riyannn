import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Transaction, TransactionMethod, TransactionStatus } from '../types';

export function useTransactions(methodFilter?: TransactionMethod | TransactionMethod[]) {
  const { user } = useAuth();
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    let q = supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (methodFilter) {
      const methods = Array.isArray(methodFilter) ? methodFilter : [methodFilter];
      q = q.in('method', methods);
    }
    const { data: rows, error: err } = await q;
    if (err) setError(err.message);
    else setData(rows ?? []);
    setLoading(false);
  }, [JSON.stringify(methodFilter)]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (payload: { user_name: string; method: TransactionMethod; amount: number; status: TransactionStatus; note: string; ticket: string; full_name: string; group_name: string; bank_account_id: string | null; bank_name: string; transaction_date: string | null; transaction_time: string | null }) => {
    const { error: err } = await supabase.from('transactions').insert({
      ...payload,
      admin_email: user?.email ?? '',
    });
    if (err) return err.message;
    await fetch();
    return null;
  };

  const update = async (id: string, payload: Partial<{ user_name: string; method: TransactionMethod; amount: number; status: TransactionStatus; note: string; ticket: string; full_name: string; group_name: string; bank_account_id: string | null; bank_name: string; transaction_date: string | null; transaction_time: string | null }>) => {
    const { error: err } = await supabase.from('transactions').update(payload).eq('id', id);
    if (err) return err.message;
    await fetch();
    return null;
  };

  const remove = async (id: string) => {
    const { error: err } = await supabase.from('transactions').delete().eq('id', id);
    if (err) return err.message;
    await fetch();
    return null;
  };

  const bulkAdd = async (rows: { date: string; time?: string; ticket: string; user_name: string; full_name: string; group_name: string; amount: number; method: TransactionMethod; status: TransactionStatus; bank_account_id: string; bank_name: string }[]) => {
    const payload = rows.map((r) => {
      const d = new Date(r.date);
      const pad = (n: number) => String(n).padStart(2, '0');
      const txDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const txTime = r.time || `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      return {
        user_name: r.user_name,
        method: r.method,
        amount: r.amount,
        status: r.status,
        note: '',
        ticket: r.ticket,
        full_name: r.full_name,
        group_name: r.group_name,
        admin_email: user?.email ?? '',
        bank_account_id: r.bank_account_id,
        bank_name: r.bank_name,
        created_at: r.date,
        transaction_date: txDate,
        transaction_time: txTime,
      };
    });
    const { error: err } = await supabase.from('transactions').insert(payload);
    if (err) return err.message;
    await fetch();
    return null;
  };

  return { data, loading, error, refetch: fetch, add, update, remove, bulkAdd };
}
