import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Eye, EyeOff, ArrowRight, CheckCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const passwordStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = passwordStrength(form.password);
  const strengthLabel = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'][strength];
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'][strength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: 'Mots de passe différents', description: 'Les mots de passe doivent correspondre.', variant: 'destructive' });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: 'Mot de passe trop court', description: 'Minimum 6 caractères requis.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { name: form.name, phone: form.phone }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Compte créé !', description: 'Vérifiez votre email pour confirmer votre inscription.' });
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <div className="benin-stripe" />

      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
            <Smartphone className="text-white" size={16} />
          </div>
          <span className="font-semibold text-sm">TracePhone Bénin</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary mx-auto flex items-center justify-center shadow-lg mb-4">
              <User size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
            <p className="text-muted-foreground text-sm mt-1">Rejoignez TracePhone Bénin gratuitement</p>
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nom complet <span className="text-destructive">*</span></label>
                  <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Jean Dupont" required className="h-11" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></label>
                  <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="votre@email.com" required className="h-11" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Téléphone</label>
                  <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+229 01 XX XX XX" className="h-11" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Mot de passe <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      placeholder="••••••••"
                      required minLength={6}
                      className="h-11 pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i <= strength ? strengthColor : "bg-border")} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{strengthLabel}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirmer le mot de passe <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <Input
                      type="password"
                      value={form.confirmPassword}
                      onChange={e => update('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      required
                      className={cn("h-11 pr-10",
                        form.confirmPassword && form.password === form.confirmPassword && "border-emerald-400",
                        form.confirmPassword && form.password !== form.confirmPassword && "border-destructive"
                      )}
                    />
                    {form.confirmPassword && form.password === form.confirmPassword && (
                      <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 gradient-primary border-0 text-white font-semibold gap-2 hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Création…</>
                  ) : (
                    <>Créer mon compte <ArrowRight size={15} /></>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Déjà un compte ?{' '}
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Se connecter
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
