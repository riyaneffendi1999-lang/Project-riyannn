import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type AdminActivity = {
  id: string;
  user_id: string | null;
  username: string;
  email: string;
  action: 'login' | 'logout';
  created_at: string;
};

export function useAdminActivity(limit = 20) {
  const [data, setData] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (!error && rows) setData(rows as AdminActivity[]);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel('admin_activity_log_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_activity_log' }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  return { data, loading, refetch: fetch };
}
