import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PoliceContact {
  id: string;
  city: string;
  commissioner_name: string;
  phone: string;
  email: string | null;
  address: string | null;
}

const cities = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou', 'Lokossa', 'Ouidah', 'Djougou', 'Kandi', 'Abomey', 'Malanville'];

export default function AdminPoliceContacts() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<PoliceContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PoliceContact | null>(null);
  const [form, setForm] = useState({ city: '', commissioner_name: '', phone: '', email: '', address: '' });

  const fetchContacts = async () => {
    const { data } = await supabase.from('police_contacts').select('*').order('city');
    setContacts((data as PoliceContact[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ city: '', commissioner_name: '', phone: '', email: '', address: '' });
    setDialogOpen(true);
  };

  const openEdit = (c: PoliceContact) => {
    setEditing(c);
    setForm({ city: c.city, commissioner_name: c.commissioner_name, phone: c.phone, email: c.email || '', address: c.address || '' });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, email: form.email || null, address: form.address || null };

    if (editing) {
      const { error } = await supabase.from('police_contacts').update(payload).eq('id', editing.id);
      if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Contact mis à jour' });
    } else {
      const { error } = await supabase.from('police_contacts').insert(payload);
      if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Contact ajouté' });
    }
    setDialogOpen(false);
    fetchContacts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce contact ?')) return;
    await supabase.from('police_contacts').delete().eq('id', id);
    toast({ title: 'Contact supprimé' });
    fetchContacts();
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Contacts des Commissariats</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd}><Plus size={16} className="mr-2" />Ajouter un contact</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Modifier le contact' : 'Nouveau contact'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Ville *</label>
                  <select value={form.city} onChange={e => update('city', e.target.value)} required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Sélectionner une ville</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Nom du Commissaire *</label>
                  <Input value={form.commissioner_name} onChange={e => update('commissioner_name', e.target.value)} placeholder="Commissaire Jean Dupont" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Téléphone *</label>
                  <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+229 XX XX XX XX" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="commissaire@police.bj" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Adresse du commissariat</label>
                  <Input value={form.address} onChange={e => update('address', e.target.value)} placeholder="Quartier, Rue..." />
                </div>
                <Button type="submit" className="w-full">{editing ? 'Mettre à jour' : 'Ajouter'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader><CardTitle>Base de données des commissaires par ville</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Chargement...</p>
            ) : contacts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Aucun contact enregistré. Cliquez sur "Ajouter un contact" pour commencer.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ville</TableHead>
                      <TableHead>Commissaire</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Adresse</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium"><span className="flex items-center gap-1"><MapPin size={14} className="text-muted-foreground" />{c.city}</span></TableCell>
                        <TableCell>{c.commissioner_name}</TableCell>
                        <TableCell><span className="flex items-center gap-1"><Phone size={14} className="text-muted-foreground" />{c.phone}</span></TableCell>
                        <TableCell>{c.email ? <span className="flex items-center gap-1"><Mail size={14} className="text-muted-foreground" />{c.email}</span> : '—'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{c.address || '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil size={16} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-destructive"><Trash2 size={16} /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
