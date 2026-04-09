import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Compte créé', description: 'Vérifiez votre email pour confirmer votre compte.' });
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="benin-stripe mb-8 rounded-full" />
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Smartphone className="text-primary-foreground" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">TracePhone</h1>
            <p className="text-sm text-muted-foreground">Bénin</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Créer un compte</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nom complet</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Jean Dupont" required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Téléphone</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+229 XX XX XX XX" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Mot de passe</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-accent font-medium hover:underline">Se connecter</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
