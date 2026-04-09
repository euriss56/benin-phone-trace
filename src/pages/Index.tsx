import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Search, Smartphone, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="benin-stripe" />

      {/* Nav */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Smartphone className="text-primary-foreground" size={18} />
            </div>
            <span className="font-bold text-lg text-foreground">TracePhone Bénin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">S'inscrire</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Vérifiez un téléphone en{' '}
            <span className="text-accent">quelques secondes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vérifiez avant d'acheter. Protégez votre téléphone. La plateforme de traçabilité des téléphones volés au Bénin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
                Commencer gratuitement
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Search, title: '1. Saisissez l\'IMEI', desc: 'Entrez le numéro IMEI du téléphone à vérifier' },
              { icon: Shield, title: '2. Analyse Instantanée', desc: 'Notre système vérifie la base de données en temps réel' },
              { icon: CheckCircle, title: '3. Résultat Fiable', desc: 'Obtenez un score de risque et le statut du téléphone' },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="text-center">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">Pourquoi utiliser la plateforme ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: AlertTriangle, title: 'Découragez le recel', desc: 'Découragez le recel de téléphones volés et dissuadez les voleurs' },
              { icon: Shield, title: 'Achetez en sérénité', desc: 'Vérifiez l\'historique d\'un téléphone avant tout achat' },
              { icon: Users, title: 'Collaborez avec les autorités', desc: 'Facilitez le travail des forces de l\'ordre avec des données fiables' },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardContent className="pt-6 space-y-3">
                  <Icon className="text-accent" size={24} />
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TracePhone Bénin. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
