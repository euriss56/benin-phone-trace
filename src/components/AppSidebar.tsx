import { Home, Shield, AlertTriangle, History, Users, BarChart3, LogOut, Menu, X, FileWarning, Contact, ChevronLeft, Brain, Wrench, Map } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { useState } from 'react';

const dealerLinks = [
  { to: '/dashboard', icon: Home, label: 'Tableau de bord' },
  { to: '/verify', icon: Shield, label: 'Vérifier IMEI' },
  { to: '/declare', icon: AlertTriangle, label: 'Déclarer un vol' },
  { to: '/history', icon: History, label: 'Historique' },
  { to: '/police-reports', icon: FileWarning, label: 'Rapports police' },
];

const technicienLinks = [
  { to: '/dashboard/technicien', icon: Home, label: 'Tableau de bord' },
  { to: '/verify', icon: Shield, label: 'Vérifier IMEI' },
  { to: '/declare', icon: AlertTriangle, label: 'Signaler anomalie' },
  { to: '/history', icon: History, label: 'Historique' },
];

const enqueteurLinks = [
  { to: '/dashboard/enqueteur', icon: Home, label: 'Tableau de bord' },
  { to: '/verify', icon: Shield, label: 'Vérifier IMEI' },
  { to: '/declare', icon: AlertTriangle, label: 'Signaler un vol' },
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

function getLinksForRole(role: AppRole | null) {
  switch (role) {
    case 'admin': return { main: dealerLinks, admin: adminLinks };
    case 'enqueteur': return { main: enqueteurLinks, admin: [] };
    case 'technicien': return { main: technicienLinks, admin: [] };
    default: return { main: dealerLinks, admin: [] };
  }
}

const ROLE_LABELS: Record<string, string> = {
  dealer: 'Dealer',
  technicien: 'Technicien',
  enqueteur: 'Enquêteur',
  admin: 'Administrateur',
  user: 'Utilisateur',
};

export default function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { main: mainLinks, admin: adminNavLinks } = getLinksForRole(role);

  const renderLink = ({ to, icon: Icon, label }: typeof mainLinks[0]) => {
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
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 md:hidden p-2.5 rounded-xl bg-card border border-border shadow-lg text-foreground"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-sidebar text-sidebar-foreground z-40 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-[68px]' : 'w-64'} ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto`}>
        <div className="benin-stripe" />

        <div className={`flex items-center ${collapsed ? 'justify-center py-5 px-2' : 'justify-between p-5'}`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
              <Shield size={18} className="text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-base leading-tight tracking-tight">TraceIMEI-BJ</h1>
                <p className="text-[10px] uppercase tracking-widest text-sidebar-muted font-medium">GETECH</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="hidden md:flex p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
              <ChevronLeft size={16} className="text-sidebar-muted" />
            </button>
          )}
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="hidden md:flex mx-auto mb-2 p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
            <ChevronLeft size={16} className="text-sidebar-muted rotate-180" />
          </button>
        )}

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-widest text-sidebar-muted font-semibold px-3 pt-4 pb-2">Navigation</p>
          )}
          {mainLinks.map(renderLink)}

          {adminNavLinks.length > 0 && (
            <>
              {!collapsed && (
                <p className="text-[10px] uppercase tracking-widest text-sidebar-muted font-semibold px-3 pt-6 pb-2">Administration</p>
              )}
              {collapsed && <div className="my-3 mx-2 border-t border-sidebar-border" />}
              {adminNavLinks.map(renderLink)}
            </>
          )}
        </nav>

        <div className={`p-4 border-t border-sidebar-border ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-accent-foreground text-sm font-bold shadow-sm flex-shrink-0">
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{profile?.name || 'Utilisateur'}</p>
                <p className="text-xs text-sidebar-muted">{ROLE_LABELS[role || 'user']}</p>
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
