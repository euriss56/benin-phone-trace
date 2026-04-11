import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('profiles').select('*, user_roles(role)');
      setUsers(data || []);
    };
    load();
  }, []);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users size={24} className="text-primary" />
            Gestion des utilisateurs
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}</p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Nom</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Téléphone</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Rôle</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Inscrit le</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={4} className="p-10 text-center">
                      <Users size={24} className="text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-muted-foreground">Aucun utilisateur</p>
                    </td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="font-medium text-foreground">{u.name || '—'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{u.phone || '—'}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          u.user_roles?.[0]?.role === 'admin'
                            ? 'bg-accent/10 text-accent border-accent/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                        } capitalize`}>
                          {u.user_roles?.[0]?.role || 'user'}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
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
