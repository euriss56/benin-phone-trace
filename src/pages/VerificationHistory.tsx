import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';
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
    const config: Record<string, { bg: string; text: string; label: string }> = {
      safe: { bg: 'bg-success/10 border-success/20', text: 'text-success', label: 'Sécurisé' },
      suspect: { bg: 'bg-warning/10 border-warning/20', text: 'text-warning', label: 'Suspect' },
      stolen: { bg: 'bg-destructive/10 border-destructive/20', text: 'text-destructive', label: 'Volé' },
    };
    const c = config[r];
    return c ? <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>{c.label}</span> : r;
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Historique des vérifications</h2>
            <p className="text-sm text-muted-foreground mt-1">{total} vérification{total > 1 ? 's' : ''} au total</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <Select value={filter} onValueChange={v => { setFilter(v); setPage(0); }}>
              <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="safe">Sécurisé</SelectItem>
                <SelectItem value="suspect">Suspect</SelectItem>
                <SelectItem value="stolen">Volé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">IMEI</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Résultat</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.length === 0 ? (
                    <tr><td colSpan={4} className="p-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={24} className="text-muted-foreground/40" />
                        <p className="text-muted-foreground text-sm">Aucune vérification trouvée</p>
                      </div>
                    </td></tr>
                  ) : checks.map(c => (
                    <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono text-sm text-foreground">{c.imei}</td>
                      <td className="p-3 text-muted-foreground text-sm">{new Date(c.checked_at).toLocaleString('fr-FR')}</td>
                      <td className="p-3">{resultBadge(c.result)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${c.result === 'safe' ? 'bg-success' : c.result === 'suspect' ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${c.risk_score}%` }} />
                          </div>
                          <span className="font-semibold text-foreground text-xs">{c.risk_score}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-8">Précédent</Button>
            <span className="flex items-center text-sm text-muted-foreground px-3">Page {page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="h-8">Suivant</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
