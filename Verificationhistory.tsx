import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { History, Search, Filter, Download, ChevronLeft, ChevronRight, Shield, AlertTriangle, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const resultConfig = {
  safe: { label: 'Sécurisé', icon: Shield, class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', barClass: 'bg-emerald-500' },
  suspect: { label: 'Suspect', icon: AlertTriangle, class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', barClass: 'bg-amber-500' },
  stolen: { label: 'Volé', icon: XCircle, class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', barClass: 'bg-red-500' },
};

export default function VerificationHistory() {
  const { user } = useAuth();
  const [checks, setChecks] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const perPage = 10;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      let query = supabase.from('imei_checks').select('*', { count: 'exact' }).eq('user_id', user.id);
      if (filter !== 'all') query = query.eq('result', filter);
      if (search) query = query.ilike('imei', `%${search}%`);
      const { data, count } = await query
        .order('checked_at', { ascending: false })
        .range(page * perPage, (page + 1) * perPage - 1);
      setChecks(data || []);
      setTotal(count || 0);
      setLoading(false);
    };
    load();
  }, [user, filter, page, search]);

  const totalPages = Math.ceil(total / perPage);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(0);
  };

  const handleFilter = (v: string) => {
    setFilter(v);
    setPage(0);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <History size={22} className="text-primary" />
              Historique des vérifications
            </h2>
            <p className="text-muted-foreground text-sm mt-1">{total} vérification{total > 1 ? 's' : ''} au total</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 self-start">
            <Download size={15} />
            Exporter
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Rechercher par IMEI…"
                  className="pl-9 h-9 font-mono"
                />
              </div>
              <Select value={filter} onValueChange={handleFilter}>
                <SelectTrigger className="h-9 w-44 gap-2">
                  <Filter size={14} className="text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les résultats</SelectItem>
                  <SelectItem value="safe">✅ Sécurisé</SelectItem>
                  <SelectItem value="suspect">⚠️ Suspect</SelectItem>
                  <SelectItem value="stolen">🚨 Volé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground text-sm mt-3">Chargement…</p>
              </div>
            ) : checks.length === 0 ? (
              <div className="py-16 text-center">
                <History size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Aucune vérification trouvée</p>
                <p className="text-muted-foreground/70 text-sm mt-1">Modifiez vos filtres ou vérifiez un IMEI</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm data-table">
                  <thead>
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">IMEI</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Résultat</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score de risque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checks.map(c => {
                      const cfg = resultConfig[c.result as keyof typeof resultConfig];
                      const Icon = cfg?.icon;
                      return (
                        <tr key={c.id}>
                          <td className="px-4 py-3 font-mono text-sm font-medium text-foreground">{c.imei}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {new Date(c.checked_at).toLocaleString('fr-FR', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", cfg?.class)}>
                              <Icon size={11} />
                              {cfg?.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full", cfg?.barClass)}
                                  style={{ width: `${c.risk_score}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono font-semibold text-foreground min-w-[32px]">{c.risk_score}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {page * perPage + 1}–{Math.min((page + 1) * perPage, total)} sur {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="gap-1"
              >
                <ChevronLeft size={14} /> Précédent
              </Button>
              <Button
                variant="outline" size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="gap-1"
              >
                Suivant <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
