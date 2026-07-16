import { X, Loader2, Trash2, AlertTriangle } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#0d1b2e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/8">
          <h2 className="text-slate-800 dark:text-white font-semibold text-base">{title}</h2>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export const inputCls = 'w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white dark:focus:bg-white/8 transition-colors';
export const selectCls = `${inputCls} cursor-pointer`;

interface FormActionsProps {
  loading: boolean;
  onClose: () => void;
  submitLabel?: string;
}

export function FormActions({ loading, onClose, submitLabel = 'Simpan' }: FormActionsProps) {
  return (
    <div className="flex gap-3 mt-6">
      <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 text-sm font-medium transition-colors">
        Batal
      </button>
      <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors shadow-lg shadow-blue-600/20">
        {loading && <Loader2 size={14} className="animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
}

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  title?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({ message, onConfirm, onClose, onCancel, loading, title = 'Hapus Data?' }: ConfirmDialogProps) {
  const handleClose = onCancel ?? onClose ?? (() => {});
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0d1b2e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
        </div>
        <p className="text-slate-800 dark:text-white font-semibold mb-2">{title}</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={handleClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors">
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
            {loading && <Loader2 size={14} className="animate-spin" />}
            <Trash2 size={13} />Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
