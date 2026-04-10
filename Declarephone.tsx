import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Camera, X, FileWarning, CheckCircle, AlertTriangle, User, Smartphone, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const cities = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou', 'Lokossa', 'Ouidah', 'Djougou', 'Kandi', 'Abomey', 'Malanville'];

const steps = [
  { id: 1, label: 'Signaleur', icon: User },
  { id: 2, label: 'Téléphone', icon: Smartphone },
  { id: 3, label: 'Localisation', icon: MapPin },
];

interface FormData {
  imei: string; brand: string; model: string; color: string;
  theft_date: string; city: string; description: string;
  reporter_lastname: string; reporter_firstname: string;
  reporter_phone: string; reporter_email: string;
}

const initialForm: FormData = {
  imei: '', brand: '', model: '', color: '', theft_date: '', city: '', description: '',
  reporter_lastname: '', reporter_firstname: '', reporter_phone: '', reporter_email: '',
};

export default function DeclarePhone() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [form, setForm] = useState<FormData>(initialForm);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');

  const update = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Partial<FormData> = {};
    if (s === 1) {
      if (!form.reporter_lastname.trim()) newErrors.reporter_lastname = 'Le nom est requis';
      if (!form.reporter_firstname.trim()) newErrors.reporter_firstname = 'Le prénom est requis';
      if (!form.reporter_phone.trim()) newErrors.reporter_phone = 'Le téléphone est requis';
      if (!form.reporter_email.trim()) newErrors.reporter_email = 'L\'email est requis';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.reporter_email)) newErrors.reporter_email = 'Email invalide';
    }
    if (s === 2) {
      if (!/^\d{15}$/.test(form.imei)) newErrors.imei = 'L\'IMEI doit contenir 15 chiffres';
      if (!form.brand.trim()) newErrors.brand = 'La marque est requise';
      if (!form.model.trim()) newErrors.model = 'Le modèle est requis';
      if (!form.theft_date) newErrors.theft_date = 'La date du vol est requise';
    }
    if (s === 3) {
      if (!form.city) newErrors.city = 'La ville est requise';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(s => Math.min(s + 1, 3));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast({ title: 'Maximum 5 photos', description: 'Vous ne pouvez pas ajouter plus de 5 photos.', variant: 'destructive' });
      return;
    }
    setPhotos(prev => [...prev, ...files]);
    files.forEach(f => setPhotoPreviews(prev => [...prev, URL.createObjectURL(f)]));
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

  const handleSubmit = async () => {
    if (!validateStep(3) || !user) return;
    setLoading(true);

    const cn_ = `TP-BJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    const photoUrls = await uploadPhotos(user.id);

    const { data: phoneData, error } = await supabase.from('stolen_phones').insert({
      user_id: user.id, imei: form.imei, brand: form.brand, model: form.model,
      color: form.color || null, theft_date: form.theft_date, city: form.city,
      description: form.description || null, status: 'pending', case_number: cn_,
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
        notes: `Déclaration auto — Dossier ${cn_} — ${form.brand} ${form.model} — Ville: ${form.city}`,
      });
    }

    setCaseNumber(cn_);
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto animate-scale-in">
          <Card className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10">
            <CardContent className="pt-8 pb-8 text-center space-y-5">
              <div className="w-20 h-20 rounded-3xl gradient-success mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle size={40} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Déclaration enregistrée !</h3>
                <p className="text-muted-foreground text-sm mt-2">Votre signalement a été transmis aux autorités policières.</p>
              </div>
              <div className="bg-background rounded-2xl p-4 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Numéro de dossier</p>
                <p className="font-mono text-lg font-bold text-primary">{caseNumber}</p>
                <p className="text-xs text-muted-foreground mt-1">Conservez ce numéro pour le suivi</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate('/police-reports')}>
                  Voir mes rapports
                </Button>
                <Button className="flex-1" onClick={() => navigate('/dashboard')}>
                  Tableau de bord
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const FormField = ({ label, error, hint, required = false, children }: { label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode }) => (
    <div className="form-group">
      <label className="form-label">{label}{required && <span className="text-destructive ml-0.5">*</span>}</label>
      {children}
      {error && <p className="form-error flex items-center gap-1"><AlertTriangle size={11} />{error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Déclarer un téléphone volé</h2>
          <p className="text-muted-foreground text-sm mt-1">Signalez votre vol et alertez automatiquement les autorités</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 text-sm font-semibold",
                    done ? "gradient-success text-white shadow-sm" :
                    active ? "gradient-primary text-white shadow-md" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {done ? <CheckCircle size={16} /> : <Icon size={16} />}
                  </div>
                  <span className={cn(
                    "text-xs mt-1.5 font-medium",
                    active ? "text-primary" : done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("h-0.5 flex-1 mx-3 rounded-full transition-all duration-300", done ? "bg-emerald-400" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-6">
            {/* Step 1: Reporter info */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User size={16} className="text-primary" />
                  Vos informations
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Nom" error={errors.reporter_lastname} required>
                    <Input value={form.reporter_lastname} onChange={e => update('reporter_lastname', e.target.value)}
                      placeholder="Doe" className={errors.reporter_lastname ? 'border-destructive' : ''} />
                  </FormField>
                  <FormField label="Prénom" error={errors.reporter_firstname} required>
                    <Input value={form.reporter_firstname} onChange={e => update('reporter_firstname', e.target.value)}
                      placeholder="Jean" className={errors.reporter_firstname ? 'border-destructive' : ''} />
                  </FormField>
                </div>
                <FormField label="Téléphone" error={errors.reporter_phone} required>
                  <Input value={form.reporter_phone} onChange={e => update('reporter_phone', e.target.value)}
                    placeholder="+229 01 XX XX XX XX" className={errors.reporter_phone ? 'border-destructive' : ''} />
                </FormField>
                <FormField label="Email" error={errors.reporter_email} required>
                  <Input type="email" value={form.reporter_email} onChange={e => update('reporter_email', e.target.value)}
                    placeholder="jean.doe@email.com" className={errors.reporter_email ? 'border-destructive' : ''} />
                </FormField>
              </div>
            )}

            {/* Step 2: Phone info */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Smartphone size={16} className="text-primary" />
                  Informations du téléphone
                </h3>
                <FormField label="IMEI (15 chiffres)" error={errors.imei} hint="Tapez *#06# sur votre téléphone" required>
                  <div className="relative">
                    <Input
                      value={form.imei}
                      onChange={e => update('imei', e.target.value.replace(/\D/g, '').slice(0, 15))}
                      placeholder="123456789012345"
                      className={cn("font-mono pr-10", errors.imei ? 'border-destructive' : form.imei.length === 15 ? 'border-emerald-400' : '')}
                      maxLength={15}
                    />
                    {form.imei.length === 15 && (
                      <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} className={cn("h-0.5 flex-1 rounded-full", i < form.imei.length ? "bg-primary" : "bg-border")} />
                    ))}
                  </div>
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Marque" error={errors.brand} required>
                    <Input value={form.brand} onChange={e => update('brand', e.target.value)}
                      placeholder="Samsung, iPhone…" className={errors.brand ? 'border-destructive' : ''} />
                  </FormField>
                  <FormField label="Modèle" error={errors.model} required>
                    <Input value={form.model} onChange={e => update('model', e.target.value)}
                      placeholder="Galaxy S23, 14 Pro…" className={errors.model ? 'border-destructive' : ''} />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Couleur">
                    <Input value={form.color} onChange={e => update('color', e.target.value)} placeholder="Noir, Blanc…" />
                  </FormField>
                  <FormField label="Date du vol" error={errors.theft_date} required>
                    <Input type="date" value={form.theft_date} onChange={e => update('theft_date', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className={errors.theft_date ? 'border-destructive' : ''} />
                  </FormField>
                </div>
              </div>
            )}

            {/* Step 3: Location & Photos */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  Lieu du vol & documents
                </h3>
                <FormField label="Ville du vol" error={errors.city} required>
                  <Select onValueChange={v => update('city', v)} value={form.city}>
                    <SelectTrigger className={errors.city ? 'border-destructive' : ''}><SelectValue placeholder="Sélectionner une ville" /></SelectTrigger>
                    <SelectContent>
                      {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Description" hint="Circonstances du vol, caractéristiques distinctives…">
                  <Textarea value={form.description} onChange={e => update('description', e.target.value)}
                    placeholder="Ex: Mon téléphone m'a été arraché dans un taxi-moto le soir…" rows={3} />
                </FormField>

                {/* Photo upload */}
                <div className="form-group">
                  <label className="form-label">Photos (max 5)</label>
                  <p className="form-hint mb-2">Facture d'achat, photo du téléphone, boîte…</p>
                  <div className="grid grid-cols-5 gap-2">
                    {photoPreviews.map((preview, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-border group">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {photos.length < 5 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors group">
                        <Camera size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-xs text-muted-foreground group-hover:text-primary mt-1 transition-colors">Ajouter</span>
                        <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 flex items-start gap-3">
                  <FileWarning size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Signalement automatique aux autorités</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      Un rapport de police sera créé et les commissariats concernés seront notifiés.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-border">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} className="gap-2">
                  <ChevronLeft size={16} />
                  Précédent
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={nextStep} className="flex-1 gap-2">
                  Suivant
                  <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Envoi en cours…</>
                  ) : (
                    <><FileWarning size={16} />Déclarer le vol & alerter la police</>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
