import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Camera, X, FileWarning, User, Phone, Mail, AlertTriangle } from 'lucide-react';
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    imei: '', brand: '', model: '', color: '', theft_date: '', city: '', description: '',
    reporter_lastname: '', reporter_firstname: '', reporter_phone: '', reporter_email: '',
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!/^\d{15}$/.test(form.imei)) errs.imei = 'L\'IMEI doit contenir exactement 15 chiffres';
    if (!form.brand.trim()) errs.brand = 'La marque est requise';
    if (!form.model.trim()) errs.model = 'Le modèle est requis';
    if (!form.theft_date) errs.theft_date = 'La date du vol est requise';
    if (!form.city) errs.city = 'La ville est requise';
    if (!form.reporter_lastname.trim()) errs.reporter_lastname = 'Le nom est requis';
    if (!form.reporter_firstname.trim()) errs.reporter_firstname = 'Le prénom est requis';
    if (!form.reporter_phone.trim()) errs.reporter_phone = 'Le numéro est requis';
    if (form.reporter_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.reporter_email)) errs.reporter_email = 'Email invalide';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast({ title: 'Erreur', description: 'Maximum 5 photos autorisées.', variant: 'destructive' });
      return;
    }
    setPhotos(prev => [...prev, ...files]);
    setPhotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
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
    if (!validate()) return;
    if (!user) return;
    setLoading(true);

    const caseNumber = `TP-BJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    const photoUrls = await uploadPhotos(user.id);

    const { data: phoneData, error } = await supabase.from('stolen_phones').insert({
      user_id: user.id, imei: form.imei, brand: form.brand, model: form.model,
      color: form.color || null, theft_date: form.theft_date, city: form.city,
      description: form.description || null, status: 'pending', case_number: caseNumber,
      photo_url: photoUrls[0] || null, photo_urls: photoUrls.length > 0 ? photoUrls : null,
    }).select('id').single();

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (phoneData) {
      await supabase.from('police_reports').insert({
        phone_id: phoneData.id, user_id: user.id, report_status: 'signalé',
        notes: `Déclaration automatique - Dossier ${caseNumber} - ${form.brand} ${form.model} - Ville: ${form.city}`,
      });
    }

    setLoading(false);
    toast({ title: 'Déclaration enregistrée', description: `Numéro de dossier: ${caseNumber}. Signalement transmis aux autorités.` });
    navigate('/dashboard');
  };

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const FieldError = ({ field }: { field: string }) => errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Déclarer un téléphone volé</h2>
          <p className="text-muted-foreground text-sm mt-1">Remplissez le formulaire pour signaler un vol aux autorités</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reporter info */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User size={16} className="text-primary" />
                Informations du signaleur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Nom *</label>
                  <Input value={form.reporter_lastname} onChange={e => update('reporter_lastname', e.target.value)} placeholder="Doe" className={errors.reporter_lastname ? 'border-destructive' : ''} />
                  <FieldError field="reporter_lastname" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Prénom *</label>
                  <Input value={form.reporter_firstname} onChange={e => update('reporter_firstname', e.target.value)} placeholder="Jean" className={errors.reporter_firstname ? 'border-destructive' : ''} />
                  <FieldError field="reporter_firstname" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Téléphone *</label>
                  <Input value={form.reporter_phone} onChange={e => update('reporter_phone', e.target.value)} placeholder="+229 XX XX XX XX" className={errors.reporter_phone ? 'border-destructive' : ''} />
                  <FieldError field="reporter_phone" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <Input type="email" value={form.reporter_email} onChange={e => update('reporter_email', e.target.value)} placeholder="jean.doe@email.com" className={errors.reporter_email ? 'border-destructive' : ''} />
                  <FieldError field="reporter_email" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phone info */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone size={16} className="text-accent" />
                Informations du téléphone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">IMEI (15 chiffres) *</label>
                <Input value={form.imei} onChange={e => update('imei', e.target.value.replace(/\D/g, '').slice(0, 15))} placeholder="123456789012345" maxLength={15} className={`font-mono ${errors.imei ? 'border-destructive' : ''}`} />
                <FieldError field="imei" />
                {!errors.imei && <p className="text-xs text-muted-foreground mt-1">💡 Tapez <code className="bg-muted px-1 py-0.5 rounded font-mono text-foreground">*#06#</code> pour obtenir l'IMEI</p>}
                {form.imei.length > 0 && form.imei.length < 15 && !errors.imei && (
                  <p className="text-xs text-muted-foreground mt-1">{15 - form.imei.length} chiffres restants</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Marque *</label>
                  <Input value={form.brand} onChange={e => update('brand', e.target.value)} placeholder="Samsung, iPhone..." className={errors.brand ? 'border-destructive' : ''} />
                  <FieldError field="brand" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Modèle *</label>
                  <Input value={form.model} onChange={e => update('model', e.target.value)} placeholder="Galaxy S23, 14 Pro..." className={errors.model ? 'border-destructive' : ''} />
                  <FieldError field="model" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Couleur</label>
                  <Input value={form.color} onChange={e => update('color', e.target.value)} placeholder="Noir, Blanc..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Date du vol *</label>
                  <Input type="date" value={form.theft_date} onChange={e => update('theft_date', e.target.value)} className={errors.theft_date ? 'border-destructive' : ''} />
                  <FieldError field="theft_date" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Ville du vol *</label>
                <Select onValueChange={v => update('city', v)}>
                  <SelectTrigger className={errors.city ? 'border-destructive' : ''}><SelectValue placeholder="Sélectionner une ville" /></SelectTrigger>
                  <SelectContent>
                    {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FieldError field="city" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                <Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Circonstances du vol, signes distinctifs..." rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera size={16} className="text-muted-foreground" />
                Photos (optionnel)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Ajoutez jusqu'à 5 photos : téléphone, facture, preuve d'achat...</p>
              <div className="flex flex-wrap gap-3">
                {photoPreviews.map((preview, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                    <img src={preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute inset-0 bg-foreground/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={16} className="text-background" />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
                    <Camera size={18} className="text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1">Ajouter</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="space-y-3">
            <div className="bg-accent/10 rounded-xl p-4 flex items-start gap-3 border border-accent/20">
              <AlertTriangle size={18} className="text-accent mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Votre déclaration sera automatiquement transmise aux autorités policières. Un rapport sera créé avec le statut "Signalé à la police". Toute fausse déclaration est passible de poursuites.
              </p>
            </div>

            <Button type="submit" className="w-full h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm text-base" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                  Envoi en cours...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Déclarer le vol et alerter la police
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
