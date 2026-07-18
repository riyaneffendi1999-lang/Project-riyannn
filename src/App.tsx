import { useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './components/LoginPage';
import type { BonusProgram } from './types';
import { Loader2 } from 'lucide-react';

const BonusView = lazy(() => import('./components/BonusView'));

function FallbackLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
    </div>
  );
}

type ActiveMenu =
  | 'dashboard'
  | 'deposit-bank' | 'bca' | 'mandiri' | 'bni' | 'bri'
  | 'deposit-emoney' | 'dana' | 'ovo' | 'gopay' | 'linkaja'
  | 'deposit-pulsa' | 'telkomsel' | 'xl'
  | 'bonus' | 'lucky-spin' | 'kamis-ceria' | 'gebyar-turnover' | 'slot-race'
  | 'settings' | 'manage-admin' | 'role-akses' | 'management-bank';

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  'deposit-bank': 'Deposit Bank', bca: 'Deposit BCA', mandiri: 'Deposit Mandiri', bni: 'Deposit BNI', bri: 'Deposit BRI',
  'deposit-emoney': 'Deposit E-Money', dana: 'Deposit DANA', ovo: 'Deposit OVO', gopay: 'Deposit GOPAY', linkaja: 'Deposit LINKAJA',
  'deposit-pulsa': 'Deposit Pulsa', telkomsel: 'Deposit Telkomsel', xl: 'Deposit XL',
  bonus: 'Bonus', 'lucky-spin': 'Lucky Spin', 'kamis-ceria': 'Kamis Ceria', 'gebyar-turnover': 'Gebyar Turnover', 'slot-race': 'Slot Race',
  settings: 'Settings', 'manage-admin': 'Manage Admin', 'role-akses': 'Role & Akses', 'management-bank': 'Management Bank',
};

const bonusMenus = new Set<string>(['lucky-spin', 'kamis-ceria', 'gebyar-turnover', 'slot-race']);

function renderContent(active: ActiveMenu) {
  if (bonusMenus.has(active)) {
    return (
      <Suspense fallback={<FallbackLoader />}>
        <BonusView view={active as BonusProgram} />
      </Suspense>
    );
  }
  return (
    <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-600">
      <p className="text-sm">Halaman {pageTitles[active] ?? active}</p>
    </div>
  );
}

function AdminApp() {
  const { user, loading, signOut, access, role, username } = useAuth();
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('lucky-spin');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#060e1a] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-blue-500 dark:text-blue-400" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-[#060e1a]">
      <Sidebar activeMenu={activeMenu} onMenuSelect={(id) => setActiveMenu(id as ActiveMenu)} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((v) => !v)} access={access} role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar pageTitle={pageTitles[activeMenu] ?? 'Panel'} onToggleSidebar={() => setSidebarCollapsed((v) => !v)} userEmail={user.email ?? ''} userId={user.id} username={username} role={role} onSignOut={signOut} />
        <main className="flex-1 overflow-y-auto p-6">{renderContent(activeMenu)}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
