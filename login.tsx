import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({
        title: 'Échec de la connexion',
        description: error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : error.message,
        variant: 'destructive'
      });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <div className="benin-stripe" />

      {/* Header */}
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
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary mx-auto flex items-center justify-center shadow-lg mb-4">
              <Shield size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Bienvenue</h1>
            <p className="text-muted-foreground text-sm mt-1">Connectez-vous à votre compte TracePhone</p>
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Adresse email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="h-11"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Mot de passe</label>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-11 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 gradient-primary border-0 text-white font-semibold gap-2 hover:opacity-90"
                  disabled={loading || !email || !password}
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connexion…</>
                  ) : (
                    <>Se connecter <ArrowRight size={15} /></>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Pas encore de compte ?{' '}
                  <Link to="/register" className="text-primary font-semibold hover:underline">
                    S'inscrire gratuitement
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
}
