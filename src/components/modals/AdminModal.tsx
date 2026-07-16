import { useState } from 'react';
import { Modal, FormActions, inputCls, selectCls } from './ModalBase';
import { SIDEBAR_ACCESS_ITEMS, ADMIN_ROLES, ADMIN_ROLE_LABELS } from '../../types';
import type { AdminRole } from '../../hooks/useAdmins';
import type { AdminUser } from '../../hooks/useAdmins';
import { ShieldCheck, ShieldOff, KeyRound, User2, Eye, EyeOff } from 'lucide-react';

interface Props {
  initial?: AdminUser;
  onClose: () => void;
  onSave: (username: string, password: string, access: string[], role: AdminRole) => Promise<string | null>;
  onSetStatus?: (status: 'active' | 'inactive') => Promise<string | null>;
  onResetPassword?: (newPassword: string) => Promise<string | null>;
}

const GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Dashboard', ids: ['dashboard'] },
  { label: 'Deposit Bank', ids: ['deposit-bank', 'bca', 'mandiri', 'bni', 'bri'] },
  { label: 'Deposit E-Money', ids: ['deposit-emoney', 'dana', 'ovo', 'gopay', 'linkaja', 'pulsa'] },
  { label: 'Bonus', ids: ['bonus', 'lucky-spin', 'kamis-ceria', 'gebyar-turnover', 'slot-race'] },
  { label: 'Settings', ids: ['settings', 'manage-admin', 'role-akses', 'management-bank'] },
];

function GroupHeader({ label, ids, access, onChange }: { label: string; ids: string[]; access: string[]; onChange: (ids: string[], checked: boolean) => void }) {
  const checked = ids.every((id) => access.includes(id));
  const indeterminate = !checked && ids.some((id) => access.includes(id));
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none mb-1">
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => { if (el) el.indeterminate = indeterminate; }}
        onChange={(e) => onChange(ids, e.target.checked)}
        className="w-3.5 h-3.5 rounded accent-blue-600"
      />
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}

function AccessCheckbox({ id, label, access, onChange }: { id: string; label: string; access: string[]; onChange: (id: string, checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none pl-4">
      <input
        type="checkbox"
        checked={access.includes(id)}
        onChange={(e) => onChange(id, e.target.checked)}
        className="w-3 h-3 rounded accent-blue-600"
      />
      <span className="text-xs text-slate-600 dark:text-slate-400">{SIDEBAR_ACCESS_ITEMS.find((x) => x.id === id)?.label ?? label}</span>
    </label>
  );
}

export default function AdminModal({ initial, onClose, onSave, onSetStatus, onResetPassword }: Props) {
  const isEdit = !!initial;
  const [username, setUsername] = useState(initial?.username ?? '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<AdminRole>(initial?.role ?? 'staff');
  const [access, setAccess] = useState<string[]>(initial?.access ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset password sub-panel
  const [showReset, setShowReset] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Status toggle
  const [statusLoading, setStatusLoading] = useState(false);

  const toggleAccess = (id: string, checked: boolean) =>
    setAccess((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id));

  const toggleGroup = (ids: string[], checked: boolean) =>
    setAccess((prev) => checked ? [...new Set([...prev, ...ids])] : prev.filter((x) => !ids.includes(x)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError('Username wajib diisi'); return; }
    if (!isEdit && password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setLoading(true);
    setError(null);
    const err = await onSave(username.trim(), password, access, role);
    if (err) { setError(err); setLoading(false); } else onClose();
  };

  const handleToggleStatus = async () => {
    if (!onSetStatus || !initial) return;
    const next = initial.status === 'active' ? 'inactive' : 'active';
    setStatusLoading(true);
    const err = await onSetStatus(next);
    setStatusLoading(false);
    if (err) setError(err); else onClose();
  };

  const handleResetPassword = async () => {
    if (!onResetPassword) return;
    if (newPwd.length < 6) { setResetMsg({ type: 'err', text: 'Password minimal 6 karakter' }); return; }
    setResetLoading(true);
    const err = await onResetPassword(newPwd);
    setResetLoading(false);
    if (err) setResetMsg({ type: 'err', text: err });
    else { setResetMsg({ type: 'ok', text: 'Password berhasil direset' }); setNewPwd(''); }
  };

  return (
    <Modal title={isEdit ? `Edit Admin: ${initial?.username}` : 'Tambah Admin'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5 block">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} placeholder="username" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="Min 6 karakter" />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Role selector */}
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5 block">Status / Role Akun</label>
          <select value={role} onChange={(e) => setRole(e.target.value as AdminRole)} className={selectCls}>
            {ADMIN_ROLES.map((r) => (
              <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>

        {isEdit && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <User2 size={16} className="text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">{initial.username}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{initial.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {initial.failed_login_count > 0 && (
                <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
                  {initial.failed_login_count}/3 gagal
                </span>
              )}
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${initial.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'}`}>
                {initial.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        )}

        {/* Access permissions */}
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2 block">Akses Menu</label>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            {GROUPS.map(({ label, ids }) => (
              <div key={label} className="space-y-1">
                <GroupHeader label={label} ids={ids} access={access} onChange={toggleGroup} />
                {ids.length > 1 && ids.map((id) => (
                  <AccessCheckbox key={id} id={id} label={id} access={access} onChange={toggleAccess} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Reset password panel (edit mode only) */}
        {isEdit && onResetPassword && (
          <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowReset((v) => !v)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <KeyRound size={13} className="text-amber-500" />
              Reset Password
              <span className="ml-auto text-slate-400">{showReset ? '▲' : '▼'}</span>
            </button>
            {showReset && (
              <div className="px-3 pb-3 pt-1 border-t border-slate-200 dark:border-white/10 space-y-2">
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className={inputCls}
                    placeholder="Password baru (min 6 karakter)"
                  />
                  <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button
                  type="button"
                  disabled={resetLoading}
                  onClick={handleResetPassword}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-medium transition-colors"
                >
                  {resetLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
                </button>
                {resetMsg && (
                  <p className={`text-xs ${resetMsg.type === 'ok' ? 'text-emerald-500' : 'text-red-500'}`}>{resetMsg.text}</p>
                )}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-500 dark:text-red-400 text-xs">{error}</p>}

        <div className="flex items-center gap-2 pt-1">
          {/* Active/Inactive toggle (edit mode only) */}
          {isEdit && onSetStatus && (
            <button
              type="button"
              disabled={statusLoading}
              onClick={handleToggleStatus}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                initial.status === 'active'
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}
            >
              {initial.status === 'active' ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
              {statusLoading ? '...' : initial.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          )}
          <div className="flex-1" />
          <FormActions loading={loading} onClose={onClose} submitLabel={isEdit ? 'Simpan Akses' : 'Buat Admin'} />
        </div>
      </form>
    </Modal>
  );
}
