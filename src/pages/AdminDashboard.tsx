import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertTriangle, Shield, Smartphone } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboard() {
  const [totalDeclarations, setTotalDeclarations] = useState(0);
  const [totalVerifications, setTotalVerifications] = useState(0);
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [decl, verif, declList] = await Promise.all([
        supabase.from('stolen_phones').select('id', { count: 'exact', head: true }),
        supabase.from('imei_checks').select('id', { count: 'exact', head: true }),
        supabase.from('stolen_phones').select('*').order('created_at', { ascending: false }).limit(20),
      ]);
      setTotalDeclarations(decl.count || 0);
      setTotalVerifications(verif.count || 0);
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
      pending: 'bg-warning/10 text-warning',
      confirmed: 'bg-success/10 text-success',
      rejected: 'bg-muted text-muted-foreground',
      stolen: 'bg-destructive/10 text-destructive',
    };
    const labels: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmé', rejected: 'Rejeté', stolen: 'Volé' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[s] || ''}`}>{labels[s] || s}</span>;
  };

  // Simulated chart data
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

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Administration</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalDeclarations}</p>
                <p className="text-sm text-muted-foreground">Téléphones déclarés</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Shield className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalVerifications}</p>
                <p className="text-sm text-muted-foreground">Vérifications IMEI</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Smartphone className="text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{declarations.filter(d => d.status === 'pending').length}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Déclarations par mois</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="declarations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Vérifications par jour</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyVerifs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="verifications" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Déclarations récentes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Dossier</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">IMEI</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Marque</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Ville</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Statut</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {declarations.map(d => (
                    <tr key={d.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-mono text-xs text-foreground">{d.case_number}</td>
                      <td className="p-3 font-mono text-foreground">{d.imei}</td>
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
