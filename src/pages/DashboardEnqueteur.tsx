import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, History, BarChart3, ArrowUpRight, Clock, Activity, FileWarning, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function DashboardEnqueteur() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ declarations: 0, verifications: 0, reports: 0 });
  const [recentChecks, setRecentChecks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [decl, verif, reports, recent] = await Promise.all([
        supabase.from('stolen_phones').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('imei_checks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('police_reports').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('imei_checks').select('*').eq('user_id', user.id).order('checked_at', { ascending: false }).limit(5),
      ]);
      setStats({ declarations: decl.count || 0, verifications: verif.count || 0, reports: reports.count || 0 });
      setRecentChecks(recent.data || []);
    };
    load();
  }, [user]);

  const resultColor = (r: string) => r === 'safe' ? 'text-success' : r === 'suspect' ? 'text-warning' : 'text-destructive';
  const resultLabel = (r: string) => r === 'safe' ? 'Légitime' : r === 'suspect' ? 'Suspect' : 'Volé';
  const resultBg = (r: string) => r === 'safe' ? 'bg-success/10' : r === 'suspect' ? 'bg-warning/10' : 'bg-destructive/10';

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="absolute top-0 left-0 right-0 h-1 bg-destructive rounded-t-xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Signalements</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.declarations}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="text-destructive" size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="absolute top-0 left-0 right-0 h-1 bg-success rounded-t-xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Vérifications</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.verifications}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Shield className="text-success" size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Rapports police</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.reports}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileWarning className="text-primary" size={22} />
              </div>
            </div>
          </div>

          <Link to="/verify" className="block">
            <div className="stat-card cursor-pointer group h-full">
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent rounded-t-xl" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Vérifier IMEI</p>
                  <p className="text-sm text-foreground mt-2">Contrôle rapide</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <ArrowUpRight className="text-accent group-hover:text-accent-foreground" size={18} />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Clock size={16} className="text-muted-foreground" /> Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentChecks.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <History size={22} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Aucune activité récente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentChecks.map(check => (
                  <div key={check.id} className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${check.result === 'safe' ? 'bg-success' : check.result === 'suspect' ? 'bg-warning' : 'bg-destructive'}`} />
                      <div>
                        <p className="text-sm font-mono font-medium text-foreground">{check.imei}</p>
                        <p className="text-xs text-muted-foreground">{new Date(check.checked_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${resultBg(check.result)} ${resultColor(check.result)}`}>
                      {resultLabel(check.result)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
