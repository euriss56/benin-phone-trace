import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Erreur de connexion', description: error.message, variant: 'destructive' });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-lg">
              <Smartphone size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TracePhone</h1>
              <p className="text-xs uppercase tracking-widest opacity-70">Bénin</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Protégez vos<br />appareils mobiles
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            Vérifiez, déclarez et tracez les téléphones volés au Bénin en toute simplicité.
          </p>
          <div className="benin-stripe mt-10 rounded-full max-w-32" />
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl gradient-accent flex items-center justify-center shadow-md">
              <Smartphone className="text-accent-foreground" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TracePhone</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Bénin</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Connexion</h2>
            <p className="text-muted-foreground text-sm mt-1">Accédez à votre tableau de bord</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Connexion...
                </div>
              ) : (
                <span className="flex items-center gap-2">Se connecter <ArrowRight size={16} /></span>
              )}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Pas de compte ?{' '}
            <Link to="/register" className="text-accent font-semibold hover:underline">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
