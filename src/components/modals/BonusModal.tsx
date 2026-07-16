import { useState } from 'react';
import { Modal, FormField, FormActions, inputCls, selectCls } from './ModalBase';
import type { BonusEntry, BonusStatus } from '../../types';

interface Props {
  initial?: BonusEntry;
  onClose: () => void;
  onSave: (payload: { user_name: string; prize: string; points: number; status: BonusStatus }) => Promise<string | null>;
}

export default function BonusModal({ initial, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    user_name: initial?.user_name ?? '',
    prize: initial?.prize ?? '',
    points: initial?.points?.toString() ?? '0',
    status: initial?.status ?? 'unclaimed',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await onSave({
      user_name: form.user_name,
      prize: form.prize,
      points: parseInt(form.points, 10),
      status: form.status as BonusStatus,
    });
    if (err) { setError(err); setLoading(false); }
    else onClose();
  };

  return (
    <Modal title={initial ? 'Edit Bonus' : 'Tambah Bonus'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nama User">
          <input className={inputCls} value={form.user_name} onChange={(e) => set('user_name', e.target.value)} placeholder="Nama pengguna" required />
        </FormField>
        <FormField label="Hadiah">
          <input className={inputCls} value={form.prize} onChange={(e) => set('prize', e.target.value)} placeholder="Cashback 10%, Free Spin x3, dll" required />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Poin">
            <input className={inputCls} type="number" min={0} value={form.points} onChange={(e) => set('points', e.target.value)} required />
          </FormField>
          <FormField label="Status">
            <select className={selectCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="unclaimed">Unclaimed</option>
              <option value="claimed">Claimed</option>
            </select>
          </FormField>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <FormActions loading={loading} onClose={onClose} />
      </form>
    </Modal>
  );
}
