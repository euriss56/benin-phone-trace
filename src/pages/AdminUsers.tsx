import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <h2 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Nom</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Téléphone</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Rôle</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Inscrit le</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Aucun utilisateur</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium text-foreground">{u.name || '—'}</td>
                      <td className="p-3 text-muted-foreground">{u.phone || '—'}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">
                          {u.user_roles?.[0]?.role || 'user'}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
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
