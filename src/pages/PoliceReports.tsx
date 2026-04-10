import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileWarning, Shield } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function PoliceReports() {
  const { user, role } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      let query = supabase
        .from('police_reports')
        .select('*, stolen_phones(imei, brand, model, case_number, city, theft_date)')
        .order('created_at', { ascending: false });

      if (role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data } = await query;
      setReports(data || []);
    };
    load();
  }, [user, role]);

  const updateStatus = async (id: string, status: string) => {
    setLoading(true);
    await supabase.from('police_reports').update({ report_status: status }).eq('id', id);
    setReports(prev => prev.map(r => r.id === id ? { ...r, report_status: status } : r));
    setLoading(false);
  };

  const statusConfig: Record<string, { label: string; class: string }> = {
    'signalé': { label: 'Signalé', class: 'bg-warning/10 text-warning' },
    'en cours d\'enquête': { label: 'En cours d\'enquête', class: 'bg-accent/10 text-accent' },
    'récupéré': { label: 'Récupéré', class: 'bg-success/10 text-success' },
    'classé': { label: 'Classé', class: 'bg-muted text-muted-foreground' },
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="text-primary" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Rapports de police</h2>
            <p className="text-muted-foreground">
              {role === 'admin' ? 'Gérez les signalements transmis aux autorités' : 'Suivez vos signalements'}
            </p>
          </div>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Aucun rapport de police trouvé.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">Dossier</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">IMEI</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Téléphone</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Ville</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Statut</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      {role === 'admin' && <th className="text-left p-3 font-medium text-muted-foreground">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r.id} className="border-b border-border last:border-0">
                        <td className="p-3 font-mono text-xs text-foreground">{r.stolen_phones?.case_number || '-'}</td>
                        <td className="p-3 font-mono text-foreground">{r.stolen_phones?.imei || '-'}</td>
                        <td className="p-3 text-foreground">{r.stolen_phones?.brand} {r.stolen_phones?.model}</td>
                        <td className="p-3 text-muted-foreground">{r.stolen_phones?.city || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[r.report_status]?.class || ''}`}>
                            {statusConfig[r.report_status]?.label || r.report_status}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                        {role === 'admin' && (
                          <td className="p-3">
                            <Select value={r.report_status} onValueChange={v => updateStatus(r.id, v)} disabled={loading}>
                              <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="signalé">Signalé</SelectItem>
                                <SelectItem value="en cours d'enquête">En cours d'enquête</SelectItem>
                                <SelectItem value="récupéré">Récupéré</SelectItem>
                                <SelectItem value="classé">Classé</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
