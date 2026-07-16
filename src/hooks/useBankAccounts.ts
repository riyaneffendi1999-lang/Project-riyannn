import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { BankAccount, BankType, BankStatus } from '../types';

export function useBankAccounts() {
  const [data, setData] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setData(rows ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel('bank_accounts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bank_accounts' }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  const add = async (payload: { name: string; code: string; account_number: string; holder_name: string; type: BankType; status: BankStatus; initial_balance: number }) => {
    const { error: err } = await supabase.from('bank_accounts').insert(payload);
    if (err) return err.message;
    await fetch();
    return null;
  };

  const update = async (id: string, payload: Partial<{ name: string; code: string; account_number: string; holder_name: string; type: BankType; status: BankStatus; initial_balance: number }>) => {
    const { error: err } = await supabase.from('bank_accounts').update(payload).eq('id', id);
    if (err) return err.message;
    await fetch();
    return null;
  };

  const remove = async (id: string) => {
    const { error: err } = await supabase.from('bank_accounts').delete().eq('id', id);
    if (err) return err.message;
    await fetch();
    return null;
  };

  return { data, loading, error, refetch: fetch, add, update, remove };
}
