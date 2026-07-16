import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { BonusEntry, BonusProgram, BonusStatus } from '../types';

export function useBonusEntries(program: BonusProgram) {
  const [data, setData] = useState<BonusEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from('bonus_entries')
      .select('*')
      .eq('program', program)
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setData(rows ?? []);
    setLoading(false);
  }, [program]);

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel(`bonus_entries_${program}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bonus_entries', filter: `program=eq.${program}` }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetch, program]);

  const add = async (payload: { user_name: string; prize: string; points: number; status: BonusStatus }) => {
    const { error: err } = await supabase.from('bonus_entries').insert({ ...payload, program });
    if (err) return err.message;
    await fetch();
    return null;
  };

  const update = async (id: string, payload: Partial<{ user_name: string; prize: string; points: number; status: BonusStatus }>) => {
    const { error: err } = await supabase.from('bonus_entries').update(payload).eq('id', id);
    if (err) return err.message;
    await fetch();
    return null;
  };

  const remove = async (id: string) => {
    const { error: err } = await supabase.from('bonus_entries').delete().eq('id', id);
    if (err) return err.message;
    await fetch();
    return null;
  };

  return { data, loading, error, refetch: fetch, add, update, remove };
}
