import { Home, Shield, AlertTriangle, History, Users, BarChart3, LogOut, Menu, X, Smartphone, FileWarning } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const userLinks = [
  { to: '/dashboard', icon: Home, label: 'Tableau de bord' },
  { to: '/verify', icon: Shield, label: 'Vérifier IMEI' },
  { to: '/declare', icon: AlertTriangle, label: 'Déclarer un vol' },
  { to: '/history', icon: History, label: 'Historique' },
  { to: '/police-reports', icon: FileWarning, label: 'Rapports police' },
];

const adminLinks = [
  { to: '/admin', icon: BarChart3, label: 'Administration' },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { to: '/admin/police', icon: FileWarning, label: 'Rapports police (admin)' },
];

export default function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = role === 'admin' ? [...userLinks, ...adminLinks] : userLinks;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-primary text-primary-foreground shadow-lg"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="fixed inset-0 bg-foreground/20 z-30 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto`}>
        <div className="benin-stripe" />
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <Smartphone size={20} className="text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">TracePhone</h1>
            <p className="text-xs opacity-70">Bénin</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {links.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80'}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-bold">
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.name || 'Utilisateur'}</p>
              <p className="text-xs opacity-60 capitalize">{role || 'user'}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity w-full"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
