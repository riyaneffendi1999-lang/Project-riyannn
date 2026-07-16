import { useState, useMemo } from 'react';
import { Modal, FormField, FormActions, inputCls, selectCls } from './ModalBase';
import type { Transaction, TransactionMethod, TransactionStatus, BankAccount } from '../../types';
import { STATUS_LABELS, formatRupiah } from '../../types';
import { Wallet } from 'lucide-react';

const statuses: TransactionStatus[] = ['approved', 'pending', 'unik', 'pindah-dana', 'biaya-admin'];

// Statuses that add to balance vs subtract
const ADD_STATUSES = new Set<TransactionStatus>(['approved', 'pending', 'unik']);
const SUB_STATUSES = new Set<TransactionStatus>(['pindah-dana', 'biaya-admin']);

function formatAmount(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('id-ID');
}

function parseAmount(formatted: string): number {
  return parseInt(formatted.replace(/\./g, ''), 10) || 0;
}

function todayStr(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function nowTimeStr(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  initial?: Transaction;
  bankAccounts?: BankAccount[];
  /** Current ending balance per bank account id (computed from all transactions) */
  bankBalances?: Record<string, number>;
  onClose: () => void;
  onSave: (payload: {
    user_name: string;
    method: TransactionMethod;
    amount: number;
    status: TransactionStatus;
    note: string;
    ticket: string;
    full_name: string;
    group_name: string;
    bank_account_id: string | null;
    bank_name: string;
    transaction_date: string | null;
    transaction_time: string | null;
  }) => Promise<string | null>;
}

export default function TransactionModal({ initial, bankAccounts = [], bankBalances = {}, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    amountDisplay: initial?.amount ? formatAmount(initial.amount.toString()) : '',
    status: initial?.status ?? 'approved',
    note: initial?.note ?? '',
    bank_account_id: initial?.bank_account_id ?? (bankAccounts[0]?.id ?? ''),
    transaction_date: initial?.transaction_date ?? todayStr(),
    transaction_time: initial?.transaction_time ?? nowTimeStr(),
    ticket: initial?.ticket ?? '',
    user_name: initial?.user_name ?? '',
    full_name: initial?.full_name ?? '',
    group_name: initial?.group_name ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, amountDisplay: formatAmount(e.target.value) }));
  };

  const selectedBank = bankAccounts.find((b) => b.id === form.bank_account_id) ?? null;

  // Current saldo akhir for the selected bank
  const currentBalance = selectedBank ? (bankBalances[selectedBank.id] ?? selectedBank.initial_balance) : 0;

  // Live preview of new saldo akhir
  const amountNum = parseAmount(form.amountDisplay);
  const isEditing = !!initial;
  const oldAmount = initial?.amount ?? 0;
  const oldStatus = initial?.status;

  const projectedBalance = useMemo(() => {
    let delta = 0;
    const newStatus = form.status as TransactionStatus;
    if (isEditing) {
      // Remove old transaction effect, add new
      if (ADD_STATUSES.has(oldStatus as TransactionStatus)) delta -= oldAmount;
      if (SUB_STATUSES.has(oldStatus as TransactionStatus)) delta += oldAmount;
    }
    if (ADD_STATUSES.has(newStatus)) delta += amountNum;
    if (SUB_STATUSES.has(newStatus)) delta -= amountNum;
    return currentBalance + delta;
  }, [currentBalance, amountNum, form.status, isEditing, oldAmount, oldStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const bank = bankAccounts.find((b) => b.id === form.bank_account_id);
    const err = await onSave({
      user_name: form.user_name.trim(),
      method: (bank?.name ?? 'OVO') as TransactionMethod,
      amount: parseAmount(form.amountDisplay),
      status: form.status as TransactionStatus,
      note: form.note,
      ticket: form.ticket.trim(),
      full_name: form.full_name.trim(),
      group_name: form.group_name.trim(),
      bank_account_id: form.bank_account_id || null,
      bank_name: bank?.name ?? '',
      transaction_date: form.transaction_date || null,
      transaction_time: form.transaction_time || null,
    });
    if (err) { setError(err); setLoading(false); }
    else onClose();
  };

  return (
    <Modal title={initial ? 'Edit Transaksi' : 'Tambah Transaksi'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tanggal">
            <input
              type="date"
              className={inputCls}
              value={form.transaction_date}
              onChange={(e) => set('transaction_date', e.target.value)}
            />
          </FormField>
          <FormField label="Jam">
            <input
              type="time"
              className={inputCls}
              value={form.transaction_time}
              onChange={(e) => set('transaction_time', e.target.value)}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tiket">
            <input
              className={inputCls}
              value={form.ticket}
              onChange={(e) => set('ticket', e.target.value)}
              placeholder="Nomor tiket..."
            />
          </FormField>
          <FormField label="Username">
            <input
              className={inputCls}
              value={form.user_name}
              onChange={(e) => set('user_name', e.target.value)}
              placeholder="Username member..."
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nama Lengkap">
            <input
              className={inputCls}
              value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)}
              placeholder="Nama lengkap member..."
            />
          </FormField>
          <FormField label="Group">
            <input
              className={inputCls}
              value={form.group_name}
              onChange={(e) => set('group_name', e.target.value)}
              placeholder="Nama group..."
            />
          </FormField>
        </div>
        <FormField label="Rekening">
          <select className={selectCls} value={form.bank_account_id} onChange={(e) => set('bank_account_id', e.target.value)}>
            <option value="">— Pilih Rekening —</option>
            {bankAccounts.map((b) => (
              <option key={b.id} value={b.id}>{b.holder_name} — {b.account_number}</option>
            ))}
          </select>
          {selectedBank && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {selectedBank.name} &bull; {selectedBank.account_number}
            </p>
          )}
        </FormField>

        {/* Saldo akhir + live preview */}
        {selectedBank && (
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Wallet size={12} className="text-slate-400" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Saldo Akhir Saat Ini</p>
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatRupiah(currentBalance)}</p>
            </div>
            <div className="border-l border-slate-200 dark:border-white/10 pl-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Wallet size={12} className="text-blue-500 dark:text-blue-400" />
                <p className="text-[10px] text-blue-500 dark:text-blue-400 uppercase tracking-wider font-semibold">Saldo Setelah Transaksi</p>
              </div>
              <p className={`text-sm font-bold ${projectedBalance >= currentBalance ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {formatRupiah(projectedBalance)}
              </p>
            </div>
          </div>
        )}

        <FormField label="Status">
          <select className={selectCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
            {statuses.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </FormField>
        <FormField label="Jumlah Deposit (Rp)">
          <input
            className={inputCls}
            type="text"
            inputMode="numeric"
            value={form.amountDisplay}
            onChange={handleAmountChange}
            placeholder="50.000"
            required
          />
        </FormField>
        <FormField label="Keterangan">
          <input className={inputCls} value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Transfer manual, dll" />
        </FormField>
        {error && <p className="text-red-500 dark:text-red-400 text-xs">{error}</p>}
        <FormActions loading={loading} onClose={onClose} />
      </form>
    </Modal>
  );
}
