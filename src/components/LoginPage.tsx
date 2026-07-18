import { useState } from 'react';
import { Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function LoginPage() {
  const { signIn } = useAuth();
  const { theme, toggle } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await signIn(email, password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-100 dark:bg-[#0a0e1a] transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-[#0a0e1a] dark:via-[#0f1829] dark:to-[#0a1020] transition-colors duration-300" />

      <button onClick={toggle} className="absolute top-5 right-5 p-2.5 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors z-10" title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}>
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <span className="text-3xl font-bold text-slate-800 dark:text-white">MaxSlot88</span>
        </div>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-7 shadow-2xl shadow-black/10 dark:shadow-black/60 transition-colors duration-300">
          <div className="mb-6 text-center">
            <h2 className="text-slate-800 dark:text-white text-lg font-bold tracking-wide">Selamat Datang</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Masuk ke panel admin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">Username</label>
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="username" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="password" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-500 dark:text-red-400 text-xs">{error}</div>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 mt-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-60 text-black font-bold rounded-xl py-2.5 text-sm transition-all shadow-lg shadow-amber-500/30">
              {loading && <Loader2 size={15} className="animate-spin" />}
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
