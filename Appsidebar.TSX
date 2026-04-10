import { Home, Shield, AlertTriangle, History, Users, BarChart3, LogOut, Menu, X, Smartphone, FileWarning, Contact, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const userLinks = [
  { to: '/dashboard', icon: Home, label: 'Tableau de bord', color: 'text-blue-400' },
  { to: '/verify', icon: Shield, label: 'Vérifier IMEI', color: 'text-emerald-400' },
  { to: '/declare', icon: AlertTriangle, label: 'Déclarer un vol', color: 'text-red-400' },
  { to: '/history', icon: History, label: 'Historique', color: 'text-purple-400' },
  { to: '/police-reports', icon: FileWarning, label: 'Rapports police', color: 'text-amber-400' },
];

const adminLinks = [
  { to: '/admin', icon: BarChart3, label: 'Administration', color: 'text-blue-400' },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs', color: 'text-purple-400' },
  { to: '/admin/police', icon: FileWarning, label: 'Rapports (admin)', color: 'text-amber-400' },
  { to: '/admin/contacts', icon: Contact, label: 'Commissariats', color: 'text-emerald-400' },
];

export default function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = role === 'admin' ? [...userLinks, ...adminLinks] : userLinks;
  const adminSectionLinks = adminLinks;
  const userSectionLinks = userLinks;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl bg-sidebar text-sidebar-foreground shadow-lg border border-sidebar-border"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-sidebar z-40 flex flex-col transition-transform duration-300 border-r border-sidebar-border",
        open ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:static md:z-auto'
      )}>
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <Smartphone size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-sidebar-foreground leading-none">TracePhone</h1>
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">Bénin · IMEI Guard</p>
          </div>
        </div>

        {/* Benin stripe */}
        <div className="benin-stripe" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-widest px-3 mb-2">Menu</p>
          {userSectionLinks.map(({ to, icon: Icon, label, color }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  active
                    ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm'
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground'
                )}
              >
                <Icon size={17} className={active ? color : 'text-sidebar-foreground/40 group-hover:' + color.replace('text-', 'text-')} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            );
          })}

          {role === 'admin' && (
            <>
              <p className="text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-widest px-3 mt-5 mb-2">Admin</p>
              {adminSectionLinks.map(({ to, icon: Icon, label, color }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                      active
                        ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm'
                        : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground'
                    )}
                  >
                    <Icon size={17} className={active ? color : 'text-sidebar-foreground/40'} />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight size={14} className="opacity-50" />}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{profile?.name || 'Utilisateur'}</p>
              <p className="text-xs text-sidebar-foreground/40 capitalize">{role === 'admin' ? '🔑 Administrateur' : '👤 Utilisateur'}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/80 transition-colors w-full px-1 py-1.5 rounded-lg hover:bg-sidebar-accent/50"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
