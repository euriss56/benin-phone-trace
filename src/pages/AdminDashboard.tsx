import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Shield, Smartphone, TrendingUp, Users } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboard() {
  const [totalDeclarations, setTotalDeclarations] = useState(0);
  const [totalVerifications, setTotalVerifications] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [decl, verif, declList, usersCount] = await Promise.all([
        supabase.from('stolen_phones').select('id', { count: 'exact', head: true }),
        supabase.from('imei_checks').select('id', { count: 'exact', head: true }),
        supabase.from('stolen_phones').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      setTotalDeclarations(decl.count || 0);
      setTotalVerifications(verif.count || 0);
      setTotalUsers(usersCount.count || 0);
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

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      confirmed: 'bg-success/10 text-success border-success/20',
      rejected: 'bg-muted text-muted-foreground border-border',
      stolen: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    const labels: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmé', rejected: 'Rejeté', stolen: 'Volé' };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[s] || ''}`}>{labels[s] || s}</span>;
  };

  const pendingCount = declarations.filter(d => d.status === 'pending').length;

  const monthlyData = [
    { month: 'Jan', declarations: 12 }, { month: 'Fév', declarations: 19 },
    { month: 'Mar', declarations: 15 }, { month: 'Avr', declarations: 25 },
    { month: 'Mai', declarations: 22 }, { month: 'Jun', declarations: 30 },
  ];
  const dailyVerifs = [
    { day: 'Lun', verifications: 45 }, { day: 'Mar', verifications: 52 },
    { day: 'Mer', verifications: 38 }, { day: 'Jeu', verifications: 67 },
    { day: 'Ven', verifications: 49 }, { day: 'Sam', verifications: 33 },
    { day: 'Dim', verifications: 28 },
  ];

  const statusData = [
    { name: 'En attente', value: declarations.filter(d => d.status === 'pending').length, color: 'hsl(var(--warning))' },
    { name: 'Confirmé', value: declarations.filter(d => d.status === 'confirmed').length, color: 'hsl(var(--success))' },
    { name: 'Volé', value: declarations.filter(d => d.status === 'stolen').length, color: 'hsl(var(--destructive))' },
    { name: 'Rejeté', value: declarations.filter(d => d.status === 'rejected').length, color: 'hsl(var(--muted-foreground))' },
  ].filter(d => d.value > 0);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Administration</h2>
          <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de la plateforme</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Déclarations', value: totalDeclarations, icon: AlertTriangle, color: 'destructive', trend: '+12%' },
            { label: 'Vérifications', value: totalVerifications, icon: Shield, color: 'success', trend: '+8%' },
            { label: 'Utilisateurs', value: totalUsers, icon: Users, color: 'primary', trend: '+5%' },
            { label: 'En attente', value: pendingCount, icon: Smartphone, color: 'warning', trend: '' },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-${stat.color} rounded-t-xl`} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                  <stat.icon className={`text-${stat.color}`} size={22} />
                </div>
              </div>
              {stat.trend && (
                <div className="flex items-center gap-1 mt-3 text-xs text-success">
                  <TrendingUp size={12} />
                  {stat.trend} ce mois
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-base">Déclarations par mois</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="declarations" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-base">Vérifications par jour</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyVerifs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="verifications" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--accent))', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Declarations table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-base">Déclarations récentes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Dossier</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">IMEI</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Appareil</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ville</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Statut</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {declarations.map(d => (
                    <tr key={d.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono text-xs text-foreground">{d.case_number}</td>
                      <td className="p-3 font-mono text-sm text-foreground">{d.imei}</td>
                      <td className="p-3 text-foreground">{d.brand} {d.model}</td>
                      <td className="p-3 text-muted-foreground">{d.city}</td>
                      <td className="p-3">{statusBadge(d.status)}</td>
                      <td className="p-3">
                        <Select value={d.status} onValueChange={v => updateStatus(d.id, v)} disabled={loading}>
                          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="confirmed">Confirmé</SelectItem>
                            <SelectItem value="rejected">Rejeté</SelectItem>
                            <SelectItem value="stolen">Volé</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
