import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const cities = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou', 'Lokossa', 'Ouidah', 'Djougou', 'Kandi', 'Abomey', 'Malanville'];

export default function DeclarePhone() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    imei: '', brand: '', model: '', color: '', theft_date: '', city: '', description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{15}$/.test(form.imei)) {
      toast({ title: 'Erreur', description: 'L\'IMEI doit contenir exactement 15 chiffres.', variant: 'destructive' });
      return;
    }
    if (!user) return;
    setLoading(true);

    const caseNumber = `TP-BJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    const { error } = await supabase.from('stolen_phones').insert({
      user_id: user.id,
      imei: form.imei,
      brand: form.brand,
      model: form.model,
      color: form.color || null,
      theft_date: form.theft_date,
      city: form.city,
      description: form.description || null,
      status: 'pending',
      case_number: caseNumber,
    });

    setLoading(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Déclaration enregistrée', description: `Numéro de dossier: ${caseNumber}` });
      navigate('/dashboard');
    }
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6">Déclarer un téléphone volé</h2>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">IMEI (15 chiffres) *</label>
                <Input value={form.imei} onChange={e => update('imei', e.target.value.replace(/\D/g, '').slice(0, 15))} placeholder="123456789012345" required maxLength={15} className="font-mono" />
                <p className="text-xs text-muted-foreground mt-1">Tapez *#06# sur votre téléphone pour obtenir l'IMEI</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Marque *</label>
                  <Input value={form.brand} onChange={e => update('brand', e.target.value)} placeholder="Samsung, iPhone..." required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Modèle *</label>
                  <Input value={form.model} onChange={e => update('model', e.target.value)} placeholder="Galaxy S23, 14 Pro..." required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Couleur</label>
                  <Input value={form.color} onChange={e => update('color', e.target.value)} placeholder="Noir, Blanc..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Date du vol *</label>
                  <Input type="date" value={form.theft_date} onChange={e => update('theft_date', e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Ville du vol *</label>
                <Select onValueChange={v => update('city', v)} required>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une ville" /></SelectTrigger>
                  <SelectContent>
                    {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Circonstances du vol..." rows={3} />
              </div>
              <Button type="submit" className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={loading}>
                {loading ? 'Envoi...' : 'Déclarer le vol'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
