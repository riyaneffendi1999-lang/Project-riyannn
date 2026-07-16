import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { BonusTaskProgram } from './useBonusTasks';

export interface BonusProgramSummary {
  program: BonusTaskProgram;
  memberCount: number;
  totalBonus: number;
}

const ALL_PROGRAMS: BonusTaskProgram[] = ['lucky-spin', 'kamis-ceria', 'gebyar-turnover', 'slot-race'];

export function useBonusSummary(from?: Date, to?: Date) {
  const [data, setData] = useState<BonusProgramSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fromISO = from?.toISOString();
  const toISO = to?.toISOString();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      let query = supabase.from('bonus_tasks').select('program, inject_bonus, prize, created_at');
      if (fromISO) query = query.gte('created_at', fromISO);
      if (toISO) query = query.lte('created_at', toISO);
      const { data: rows } = await query;

      if (cancelled) return;

      const map = new Map<string, { count: number; total: number }>();
      ALL_PROGRAMS.forEach((p) => map.set(p, { count: 0, total: 0 }));

      (rows ?? []).forEach((r: { program: string; inject_bonus: number; prize?: string | null }) => {
        const entry = map.get(r.program);
        if (entry) {
          entry.count += 1;
          let bonus = r.inject_bonus ?? 0;
          // For programs that store prize as a string (e.g. gebyar-turnover), parse it
          if (bonus === 0 && r.prize) {
            const parsed = parseFloat(r.prize.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, ''));
            if (!isNaN(parsed)) bonus = parsed;
          }
          entry.total += bonus;
        }
      });

      setData(
        ALL_PROGRAMS.map((p) => ({
          program: p,
          memberCount: map.get(p)!.count,
          totalBonus: map.get(p)!.total,
        }))
      );
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [fromISO, toISO]);

  return { data, loading };
}
