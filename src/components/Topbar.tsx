import { useState, useEffect } from 'react';
import { LogOut, Sun, Moon, Clock } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { ADMIN_ROLE_LABELS, ADMIN_ROLE_STYLES } from '../types';
import type { AdminRole } from '../types';

type Props = {
  pageTitle: string;
  onToggleSidebar: () => void;
  userEmail: string;
  userId: string;
  username: string;
  role: AdminRole;
  onSignOut: () => void;
};

export default function Topbar({ pageTitle, onToggleSidebar, userEmail, userId, username, role, onSignOut }: Props) {
  void pageTitle; void onToggleSidebar; void userId;
  const { theme, toggle } = useTheme();
  const [wibTime, setWibTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const wib = new Date(now.getTime() + (now.getTimezoneOffset() + 420) * 60000);
      setWibTime(wib.toLocaleString('id-ID', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-[#0a1628]/80 backdrop-blur-sm border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      <div className="flex-1" />

      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
        <Clock size={15} className="text-blue-500 dark:text-blue-400 shrink-0" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums whitespace-nowrap">{wibTime} WIB</span>
      </div>

      <div className="flex-1 flex items-center justify-end gap-3">
        <button onClick={toggle} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {(username || userEmail).slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-slate-800 dark:text-white text-xs font-semibold leading-none">{username || userEmail.split('@')[0]}</p>
            <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${ADMIN_ROLE_STYLES[role]}`}>
              {ADMIN_ROLE_LABELS[role]}
            </span>
          </div>
          <button onClick={onSignOut} className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors ml-2">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
