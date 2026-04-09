import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function VerificationHistory() {
  const { user } = useAuth();
  const [checks, setChecks] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const perPage = 10;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      let query = supabase.from('imei_checks').select('*', { count: 'exact' }).eq('user_id', user.id);
      if (filter !== 'all') query = query.eq('result', filter);
      const { data, count } = await query.order('checked_at', { ascending: false }).range(page * perPage, (page + 1) * perPage - 1);
      setChecks(data || []);
      setTotal(count || 0);
    };
    load();
  }, [user, filter, page]);

  const resultBadge = (r: string) => {
    const styles = {
      safe: 'bg-success/10 text-success',
      suspect: 'bg-warning/10 text-warning',
      stolen: 'bg-destructive/10 text-destructive',
    };
    const labels = { safe: 'Sécurisé', suspect: 'Suspect', stolen: 'Volé' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[r as keyof typeof styles] || ''}`}>{labels[r as keyof typeof labels] || r}</span>;
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">Historique des vérifications</h2>
          <Select value={filter} onValueChange={v => { setFilter(v); setPage(0); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="safe">Sécurisé</SelectItem>
              <SelectItem value="suspect">Suspect</SelectItem>
              <SelectItem value="stolen">Volé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">IMEI</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Résultat</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Aucune vérification trouvée</td></tr>
                  ) : checks.map(c => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-mono text-foreground">{c.imei}</td>
                      <td className="p-3 text-muted-foreground">{new Date(c.checked_at).toLocaleString('fr-FR')}</td>
                      <td className="p-3">{resultBadge(c.result)}</td>
                      <td className="p-3 font-semibold text-foreground">{c.risk_score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Précédent</Button>
            <span className="flex items-center text-sm text-muted-foreground">Page {page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Suivant</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
