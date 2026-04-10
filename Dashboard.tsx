import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, History, TrendingUp, Activity, Clock, ChevronRight, Smartphone, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const resultConfig = {
  safe: { label: 'Sécurisé', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
  suspect: { label: 'Suspect', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  stolen: { label: 'Volé', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ declarations: 0, verifications: 0, safe: 0, stolen: 0 });
  const [recentChecks, setRecentChecks] = useState<any[]>([]);
  const [recentDeclarations, setRecentDeclarations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [decl, verif, safeCount, stolenCount, recent, declarations] = await Promise.all([
        supabase.from('stolen_phones').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('imei_checks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('imei_checks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('result', 'safe'),
        supabase.from('imei_checks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('result', 'stolen'),
        supabase.from('imei_checks').select('*').eq('user_id', user.id).order('checked_at', { ascending: false }).limit(5),
        supabase.from('stolen_phones').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      ]);
      setStats({
        declarations: decl.count || 0,
        verifications: verif.count || 0,
        safe: safeCount.count || 0,
        stolen: stolenCount.count || 0,
      });
      setRecentChecks(recent.data || []);
      setRecentDeclarations(declarations.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const statCards = [
    {
      label: 'Déclarations',
      value: stats.declarations,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-orange-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Vérifications',
      value: stats.verifications,
      icon: Search,
      gradient: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'IMEI sûrs',
      value: stats.safe,
      icon: Shield,
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Volés détectés',
      value: stats.stolen,
      icon: Activity,
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {greeting()}, {profile?.name?.split(' ')[0] || 'Utilisateur'} 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Voici un aperçu de votre activité sur TracePhone Bénin
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/verify">
              <Button size="sm" variant="outline" className="gap-2">
                <Search size={15} />
                Vérifier IMEI
              </Button>
            </Link>
            <Link to="/declare">
              <Button size="sm" className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                <AlertTriangle size={15} />
                Déclarer un vol
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, gradient, bg, text }, i) => (
            <div
              key={label}
              className="stat-card"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon size={18} className={text} />
                </div>
                <TrendingUp size={14} className="text-muted-foreground/50 mt-1" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{loading ? '—' : value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/declare">
            <Card className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-red-200/60 dark:border-red-900/30 cursor-pointer overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl gradient-danger flex items-center justify-center shadow-md flex-shrink-0">
                    <AlertTriangle size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">Déclarer un vol</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Signalez un téléphone volé avec IMEI</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/verify">
            <Card className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-emerald-200/60 dark:border-emerald-900/30 cursor-pointer overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl gradient-success flex items-center justify-center shadow-md flex-shrink-0">
                    <Shield size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">Vérifier un IMEI</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Vérifiez avant d'acheter un téléphone</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent verifications */}
          <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock size={15} className="text-muted-foreground" />
                  Vérifications récentes
                </CardTitle>
                <Link to="/history">
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-foreground">
                    Voir tout
                    <ChevronRight size={13} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentChecks.length === 0 ? (
                <div className="text-center py-8">
                  <Shield size={32} className="text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune vérification</p>
                  <Link to="/verify">
                    <Button size="sm" variant="outline" className="mt-3 text-xs">
                      Vérifier un IMEI
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentChecks.map(check => {
                    const config = resultConfig[check.result as keyof typeof resultConfig];
                    return (
                      <div key={check.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${config?.dot}`} />
                          <div>
                            <p className="text-sm font-mono font-medium text-foreground">{check.imei}</p>
                            <p className="text-xs text-muted-foreground">{new Date(check.checked_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config?.class}`}>
                            {config?.label}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">{check.risk_score}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent declarations */}
          <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Smartphone size={15} className="text-muted-foreground" />
                  Mes déclarations
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {recentDeclarations.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle size={32} className="text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune déclaration</p>
                  <Link to="/declare">
                    <Button size="sm" variant="outline" className="mt-3 text-xs">
                      Faire une déclaration
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentDeclarations.map(decl => (
                    <div key={decl.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <Smartphone size={16} className="text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{decl.brand} {decl.model}</p>
                        <p className="text-xs text-muted-foreground font-mono">{decl.case_number}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs flex-shrink-0 ${
                          decl.status === 'confirmed' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' :
                          decl.status === 'rejected' ? 'border-muted-foreground text-muted-foreground' :
                          'border-amber-500 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {decl.status === 'pending' ? 'En attente' : decl.status === 'confirmed' ? 'Confirmé' : decl.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
