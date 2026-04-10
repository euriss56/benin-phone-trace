import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Camera, X, FileWarning } from 'lucide-react';
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
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    imei: '', brand: '', model: '', color: '', theft_date: '', city: '', description: '',
    reporter_lastname: '', reporter_firstname: '', reporter_phone: '', reporter_email: '',
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast({ title: 'Erreur', description: 'Maximum 5 photos autorisées.', variant: 'destructive' });
      return;
    }
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);
    const previews = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews(prev => [...prev, ...previews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (userId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const photo of photos) {
      const ext = photo.name.split('.').pop();
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('phone-photos').upload(path, photo);
      if (!error) {
        const { data } = supabase.storage.from('phone-photos').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{15}$/.test(form.imei)) {
      toast({ title: 'Erreur', description: 'L\'IMEI doit contenir exactement 15 chiffres.', variant: 'destructive' });
      return;
    }
    if (!user) return;
    setLoading(true);

    const caseNumber = `TP-BJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Upload photos
    const photoUrls = await uploadPhotos(user.id);

    // Insert stolen phone
    const { data: phoneData, error } = await supabase.from('stolen_phones').insert({
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
      photo_url: photoUrls.length > 0 ? photoUrls[0] : null,
      photo_urls: photoUrls.length > 0 ? photoUrls : null,
    }).select('id').single();

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Auto-create police report
    if (phoneData) {
      await supabase.from('police_reports').insert({
        phone_id: phoneData.id,
        user_id: user.id,
        report_status: 'signalé',
        notes: `Déclaration automatique - Dossier ${caseNumber} - ${form.brand} ${form.model} - Ville: ${form.city}`,
      });
    }

    setLoading(false);
    toast({ title: 'Déclaration enregistrée', description: `Numéro de dossier: ${caseNumber}. Signalement transmis aux autorités.` });
    navigate('/dashboard');
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6">Déclarer un téléphone volé</h2>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Informations du signaleur */}
              <h3 className="text-lg font-semibold text-foreground">Informations du signaleur</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nom *</label>
                  <Input value={form.reporter_lastname} onChange={e => update('reporter_lastname', e.target.value)} placeholder="Doe" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Prénom *</label>
                  <Input value={form.reporter_firstname} onChange={e => update('reporter_firstname', e.target.value)} placeholder="Jean" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Numéro de téléphone *</label>
                  <Input value={form.reporter_phone} onChange={e => update('reporter_phone', e.target.value)} placeholder="+229 XX XX XX XX" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email *</label>
                  <Input type="email" value={form.reporter_email} onChange={e => update('reporter_email', e.target.value)} placeholder="jean.doe@email.com" required />
                </div>
              </div>

              <hr className="my-2 border-border" />
              <h3 className="text-lg font-semibold text-foreground">Informations du téléphone</h3>
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

              {/* Photo upload */}
              <div>
                <label className="text-sm font-medium text-foreground">Photos (max 5)</label>
                <p className="text-xs text-muted-foreground mb-2">Ajoutez des photos du téléphone, facture, preuve d'achat...</p>
                <div className="flex flex-wrap gap-3 mb-3">
                  {photoPreviews.map((preview, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                      <img src={preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePhoto(i)} className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl-lg p-0.5">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Camera size={20} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Ajouter</span>
                      <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="bg-accent/10 rounded-lg p-3 flex items-start gap-2">
                <FileWarning size={18} className="text-accent mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Votre déclaration sera automatiquement transmise aux autorités policières. Un rapport sera créé avec le statut "Signalé à la police".
                </p>
              </div>

              <Button type="submit" className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Déclarer le vol et alerter la police'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
