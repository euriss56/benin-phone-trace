import { Home, Shield, AlertTriangle, History, Users, BarChart3, LogOut, Menu, X, Smartphone, FileWarning, Contact, ChevronLeft, Brain } from 'lucide-react';
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
  { to: '/admin/police', icon: FileWarning, label: 'Rapports police' },
  { to: '/admin/contacts', icon: Contact, label: 'Commissariats' },
  { to: '/admin/ml', icon: Brain, label: 'Entraînement ML' },
];

export default function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const links = role === 'admin' ? [...userLinks, ...adminLinks] : userLinks;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 md:hidden p-2.5 rounded-xl bg-card border border-border shadow-lg text-foreground"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-sidebar text-sidebar-foreground z-40 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-[68px]' : 'w-64'} ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto`}>
        <div className="benin-stripe" />

        {/* Header */}
        <div className={`flex items-center ${collapsed ? 'justify-center py-5 px-2' : 'justify-between p-5'}`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center shadow-md flex-shrink-0">
              <Smartphone size={18} className="text-accent-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-base leading-tight tracking-tight">TracePhone</h1>
                <p className="text-[10px] uppercase tracking-widest text-sidebar-muted font-medium">Bénin</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="hidden md:flex p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
              <ChevronLeft size={16} className="text-sidebar-muted" />
            </button>
          )}
        </div>

        {/* Collapse expand button (collapsed state) */}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="hidden md:flex mx-auto mb-2 p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
            <ChevronLeft size={16} className="text-sidebar-muted rotate-180" />
          </button>
        )}

        {/* Nav sections */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-widest text-sidebar-muted font-semibold px-3 pt-4 pb-2">Navigation</p>
          )}
          {userLinks.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <Icon size={18} className={`flex-shrink-0 transition-colors ${active ? 'text-accent' : 'group-hover:text-accent/70'}`} />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}

          {role === 'admin' && (
            <>
              {!collapsed && (
                <p className="text-[10px] uppercase tracking-widest text-sidebar-muted font-semibold px-3 pt-6 pb-2">Administration</p>
              )}
              {collapsed && <div className="my-3 mx-2 border-t border-sidebar-border" />}
              {adminLinks.map(({ to, icon: Icon, label }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    title={collapsed ? label : undefined}
                    className={`flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    }`}
                  >
                    <Icon size={18} className={`flex-shrink-0 transition-colors ${active ? 'text-accent' : 'group-hover:text-accent/70'}`} />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-sidebar-border ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-accent-foreground text-sm font-bold shadow-sm flex-shrink-0">
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{profile?.name || 'Utilisateur'}</p>
                <p className="text-xs text-sidebar-muted capitalize">{role || 'user'}</p>
              </div>
            </div>
          )}
          <button
            onClick={signOut}
            title={collapsed ? 'Déconnexion' : undefined}
            className={`flex items-center gap-2 text-sm text-sidebar-muted hover:text-sidebar-foreground transition-colors ${collapsed ? '' : 'w-full'} py-1.5 ${collapsed ? 'px-2' : 'px-1'} rounded-lg hover:bg-sidebar-accent/50`}
          >
            <LogOut size={16} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
