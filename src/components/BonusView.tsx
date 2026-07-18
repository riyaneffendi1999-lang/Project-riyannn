import { useState, useMemo } from 'react';
import { Loader2, CheckCircle2, Trash2, Search, Calendar, ChevronDown } from 'lucide-react';
import { useBonusTasks } from '../hooks/useBonusTasks';
import { useAuth } from '../hooks/useAuth';
import { formatRupiah } from '../types';
import type { BonusProgram } from '../types';

type Period = 'today' | 'yesterday' | 'current-week' | 'current-month' | 'anothers';
const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today', yesterday: 'Yesterday',
  'current-week': 'Current Week', 'current-month': 'Current Month', anothers: 'Anothers',
};

function getPeriodRange(period: Period, customFrom?: string, customTo?: string): { from: Date; to: Date } {
  const now = new Date();
  const s = (y: number, m: number, d: number) => new Date(y, m, d, 0, 0, 0, 0);
  const e = (y: number, m: number, d: number) => new Date(y, m, d, 23, 59, 59, 999);
  if (period === 'today') return { from: s(now.getFullYear(), now.getMonth(), now.getDate()), to: e(now.getFullYear(), now.getMonth(), now.getDate()) };
  if (period === 'yesterday') { const y = new Date(now); y.setDate(now.getDate() - 1); return { from: s(y.getFullYear(), y.getMonth(), y.getDate()), to: e(y.getFullYear(), y.getMonth(), y.getDate()) }; }
  if (period === 'current-week') { const day = now.getDay(); const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1)); return { from: s(mon.getFullYear(), mon.getMonth(), mon.getDate()), to: e(now.getFullYear(), now.getMonth(), now.getDate()) }; }
  if (period === 'current-month') return { from: s(now.getFullYear(), now.getMonth(), 1), to: e(now.getFullYear(), now.getMonth(), now.getDate()) };
  return { from: customFrom ? new Date(customFrom + 'T00:00:00') : new Date(0), to: customTo ? new Date(customTo + 'T23:59:59') : new Date(8640000000000000) };
}

function PeriodDropdown({ value, onChange }: { value: Period; onChange: (v: Period) => void }) {
  const [open, setOpen] = useState(false);
  const periods: Period[] = ['today', 'yesterday', 'current-week', 'current-month', 'anothers'];
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 hover:border-blue-500/40 transition-colors min-w-[130px] justify-between">
        <div className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-500 dark:text-blue-400 shrink-0" />{PERIOD_LABELS[value]}</div>
        <ChevronDown size={11} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#0d1b2e] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
            {periods.map((p) => (
              <button key={p} onClick={() => { onChange(p); setOpen(false); }} className={`w-full text-left px-3 py-2 text-xs transition-colors ${p === value ? 'text-blue-600 dark:text-blue-400 bg-blue-500/5' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>{PERIOD_LABELS[p]}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function formatAmount(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('id-ID');
}

function parseAmount(formatted: string): number {
  return parseInt(formatted.replace(/\./g, ''), 10) || 0;
}

const PROGRAM_TITLES: Record<BonusProgram, string> = {
  'lucky-spin': 'Lucky Spin',
  'kamis-ceria': 'Kamis Ceria',
  'gebyar-turnover': 'Gebyar Turnover',
  'slot-race': 'Slot Race',
};

interface Props {
  view: BonusProgram;
}

export default function BonusView({ view }: Props) {
  const { data, loading, add, remove } = useBonusTasks(view);
  const { username } = useAuth();

  // Left form state
  const [formUsername, setFormUsername] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Right table filters
  const [period, setPeriod] = useState<Period>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [search, setSearch] = useState('');

  // Pending items (left column) - status = 'pending'
  const pendingItems = useMemo(() => data.filter((d) => d.status === 'pending'), [data]);

  // Completed items (right column) - status = 'complete'
  const periodRange = useMemo(() => getPeriodRange(period, customFrom, customTo), [period, customFrom, customTo]);
  const completedItems = useMemo(() => {
    return data.filter((d) => {
      if (d.status !== 'complete') return false;
      const matchSearch = !search || d.user_name.toLowerCase().includes(search.toLowerCase());
      const dt = new Date(d.created_at);
      return matchSearch && dt >= periodRange.from && dt <= periodRange.to;
    });
  }, [data, search, periodRange]);

  const totalCompleted = completedItems.reduce((a, d) => a + d.inject_bonus, 0);

  // Handle Complete button: add directly with status 'complete'
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const trimmedUsername = formUsername.trim();
    const amount = parseAmount(formAmount);

    if (!trimmedUsername) {
      setFormError('Username wajib diisi');
      return;
    }
    if (amount <= 0) {
      setFormError('Inject bonus harus lebih dari 0');
      return;
    }

    setFormLoading(true);
    const err = await add({
      program: view,
      ticket: '',
      user_name: trimmedUsername,
      inject_bonus: amount,
      status: 'complete',
      total_turnover: 0,
      prize: '',
      completed_at: new Date().toISOString(),
      completed_by: username || null,
    });
    setFormLoading(false);

    if (err) {
      setFormError(err);
    } else {
      setFormSuccess(`${trimmedUsername} - ${formatRupiah(amount)} berhasil dicatat`);
      setFormUsername('');
      setFormAmount('');
      setTimeout(() => setFormSuccess(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-blue-500 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{PROGRAM_TITLES[view]}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Kelola bonus program {PROGRAM_TITLES[view]}</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT COLUMN - Form Input + Complete */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0d1b2e] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5">
              <h2 className="text-slate-800 dark:text-white font-semibold text-sm">Input Bonus</h2>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Masukkan username dan inject bonus</p>
            </div>

            <form onSubmit={handleComplete} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">Username</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">Inject Bonus (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formAmount}
                  onChange={(e) => setFormAmount(formatAmount(e.target.value))}
                  placeholder="50.000"
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-2">
                  <CheckCircle2 size={13} />
                  {formSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors shadow-lg shadow-emerald-600/20"
              >
                {formLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Complete
              </button>
            </form>
          </div>

          {/* Pending items (if any) */}
          {pendingItems.length > 0 && (
            <div className="bg-white dark:bg-[#0d1b2e] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-slate-800 dark:text-white font-semibold text-sm">Pending</h3>
                <span className="text-xs text-slate-400 dark:text-slate-500 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">{pendingItems.length}</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-64 overflow-y-auto">
                {pendingItems.map((item) => (
                  <PendingItem key={item.id} item={item} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Completed Table */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-[#0d1b2e] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-slate-800 dark:text-white font-semibold text-sm">Data Completed</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                    {completedItems.length} data &bull; Total: <span className="text-emerald-500 dark:text-emerald-400 font-semibold">{formatRupiah(totalCompleted)}</span>
                  </p>
                </div>
                <PeriodDropdown value={period} onChange={setPeriod} />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 mt-3">
                {period === 'anothers' && (
                  <>
                    <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors" />
                    <span className="text-slate-400 dark:text-slate-600 text-xs">—</span>
                    <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors" />
                  </>
                )}
                <div className="relative flex-1 max-w-[200px]">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari username..."
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <th className="text-left text-xs text-slate-500 dark:text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">No</th>
                    <th className="text-left text-xs text-slate-500 dark:text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Username</th>
                    <th className="text-left text-xs text-slate-500 dark:text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Inject Bonus</th>
                    <th className="text-left text-xs text-slate-500 dark:text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Tanggal</th>
                    <th className="text-left text-xs text-slate-500 dark:text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Admin</th>
                    <th className="text-right text-xs text-slate-500 dark:text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {completedItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm text-slate-800 dark:text-white font-medium">{item.user_name}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{formatRupiah(item.inject_bonus)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-400 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' '}
                        {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{item.completed_by || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {completedItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center text-slate-400 dark:text-slate-600 text-sm">
                        Belum ada data completed
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer summary */}
            {completedItems.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">{completedItems.length} entries</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(totalCompleted)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingItem({ item, onDelete }: { item: { id: string; user_name: string; inject_bonus: number; created_at: string }; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div>
        <p className="text-sm text-slate-800 dark:text-white font-medium">{item.user_name}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{formatRupiah(item.inject_bonus)}</p>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
