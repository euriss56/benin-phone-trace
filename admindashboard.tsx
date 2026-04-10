import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { AlertTriangle, Shield, Smartphone, Users, TrendingUp, Activity, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: 'En attente', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  confirmed: { label: 'Confirmé', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected: { label: 'Rejeté', class: 'bg-muted text-muted-foreground' },
  stolen: { label: 'Volé', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.key} style={{ color: p.color }} className="text-xs">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [totalDeclarations, setTotalDeclarations] = useState(0);
  const [totalVerifications, setTotalVerifications] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [decl, verif, users, declList] = await Promise.all([
        supabase.from('stolen_phones').select('id', { count: 'exact', head: true }),
        supabase.from('imei_checks').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('stolen_phones').select('*').order('created_at', { ascending: false }).limit(20),
      ]);
      setTotalDeclarations(decl.count || 0);
      setTotalVerifications(verif.count || 0);
      setTotalUsers(users.count || 0);
      setDeclarations(declList.data || []);
    };
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setLoading(true);
    await supabase.from('stolen_phones').update({ status }).eq('id', id);
    setDeclarations(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    setLoading(false);
  };

  const statCards = [
    { label: 'Téléphones déclarés', value: totalDeclarations, icon: AlertTriangle, bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', change: '+12%' },
    { label: 'Vérifications IMEI', value: totalVerifications, icon: Shield, bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', change: '+28%' },
    { label: 'Utilisateurs inscrits', value: totalUsers, icon: Users, bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', change: '+8%' },
    { label: 'Dossiers en attente', value: declarations.filter(d => d.status === 'pending').length, icon: Activity, bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', change: '' },
  ];

  const monthlyData = [
    { month: 'Jan', declarations: 12, verifications: 145 },
    { month: 'Fév', declarations: 19, verifications: 198 },
    { month: 'Mar', declarations: 15, verifications: 167 },
    { month: 'Avr', declarations: 25, verifications: 245 },
    { month: 'Mai', declarations: 22, verifications: 223 },
    { month: 'Jun', declarations: 30, verifications: 310 },
    { month: 'Jul', declarations: 28, verifications: 287 },
  ];

  const dailyVerifs = [
    { day: 'Lun', verifications: 45 },
    { day: 'Mar', verifications: 52 },
    { day: 'Mer', verifications: 38 },
    { day: 'Jeu', verifications: 67 },
    { day: 'Ven', verifications: 49 },
    { day: 'Sam', verifications: 33 },
    { day: 'Dim', verifications: 28 },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tableau de bord administrateur</h2>
          <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble de la plateforme TracePhone Bénin</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, bg, text, change }, i) => (
            <div key={label} className="stat-card" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon size={18} className={text} />
                </div>
                {change && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp size={11} />{change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Déclarations & vérifications / mois</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="gradDecl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradVerif" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="declarations" name="Déclarations" stroke="#ef4444" strokeWidth={2} fill="url(#gradDecl)" dot={false} />
                  <Area type="monotone" dataKey="verifications" name="Vérifications" stroke="#3b82f6" strokeWidth={2} fill="url(#gradVerif)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Vérifications de la semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyVerifs} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="verifications" name="Vérifications" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Declarations table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Déclarations récentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm data-table">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dossier</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">IMEI</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Appareil</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ville</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {declarations.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">Aucune déclaration</td></tr>
                  ) : declarations.map(d => {
                    const cfg = statusConfig[d.status];
                    return (
                      <tr key={d.id}>
                        <td className="px-4 py-3 font-mono text-xs text-primary font-medium">{d.case_number}</td>
                        <td className="px-4 py-3 font-mono text-xs text-foreground">{d.imei}</td>
                        <td className="px-4 py-3 text-foreground font-medium">{d.brand} {d.model}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{d.city}</td>
                        <td className="px-4 py-3">
                          <span className={cn("status-badge", cfg?.class)}>
                            {cfg?.label || d.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Select value={d.status} onValueChange={v => updateStatus(d.id, v)} disabled={loading}>
                            <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="confirmed">Confirmé</SelectItem>
                              <SelectItem value="rejected">Rejeté</SelectItem>
                              <SelectItem value="stolen">Volé</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
