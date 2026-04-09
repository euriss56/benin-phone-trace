import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, History, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ declarations: 0, verifications: 0 });
  const [recentChecks, setRecentChecks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [decl, verif, recent] = await Promise.all([
        supabase.from('stolen_phones').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('imei_checks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('imei_checks').select('*').eq('user_id', user.id).order('checked_at', { ascending: false }).limit(5),
      ]);
      setStats({ declarations: decl.count || 0, verifications: verif.count || 0 });
      setRecentChecks(recent.data || []);
    };
    load();
  }, [user]);

  const resultColor = (r: string) => r === 'safe' ? 'text-success' : r === 'suspect' ? 'text-warning' : 'text-destructive';
  const resultLabel = (r: string) => r === 'safe' ? 'Sécurisé' : r === 'suspect' ? 'Suspect' : 'Volé';

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bienvenue, {profile?.name || 'Utilisateur'} 👋</h2>
          <p className="text-muted-foreground">Tableau de bord TracePhone Bénin</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.declarations}</p>
                <p className="text-sm text-muted-foreground">Déclarations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Shield className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.verifications}</p>
                <p className="text-sm text-muted-foreground">Vérifications</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/declare">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-destructive/20">
              <CardContent className="p-6 flex items-center gap-4">
                <AlertTriangle className="text-destructive" />
                <div>
                  <p className="font-semibold text-foreground">Déclarer un vol</p>
                  <p className="text-sm text-muted-foreground">Signaler un téléphone volé</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/verify">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-success/20">
              <CardContent className="p-6 flex items-center gap-4">
                <Shield className="text-success" />
                <div>
                  <p className="font-semibold text-foreground">Vérifier un IMEI</p>
                  <p className="text-sm text-muted-foreground">Vérifiez avant d'acheter</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History size={18} /> Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentChecks.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune activité récente</p>
            ) : (
              <div className="space-y-3">
                {recentChecks.map(check => (
                  <div key={check.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-mono text-foreground">{check.imei}</p>
                      <p className="text-xs text-muted-foreground">{new Date(check.checked_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <span className={`text-sm font-semibold ${resultColor(check.result)}`}>
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
