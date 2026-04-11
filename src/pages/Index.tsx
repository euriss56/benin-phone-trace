import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Search, Smartphone, CheckCircle, Users, ArrowRight, Globe, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="benin-stripe" />

      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-border/50 bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center shadow-md">
              <Smartphone className="text-accent-foreground" size={18} />
            </div>
            <div>
              <span className="font-bold text-base text-foreground tracking-tight">TracePhone</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1.5 font-medium">Bénin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm">
                S'inscrire
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20">
            <Shield size={14} />
            Plateforme officielle de traçabilité
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
            Protégez vos téléphones,{' '}
            <span className="bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent">
              luttez contre le vol
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Vérifiez avant d'acheter. Déclarez un vol. Retrouvez votre téléphone. La plateforme de traçabilité des téléphones volés au Bénin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/register">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 shadow-lg shadow-accent/20 h-12 text-base">
                Commencer gratuitement
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base border-border/60">
                Se connecter
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-8">
            {[
              { value: '1000+', label: 'Téléphones tracés' },
              { value: '12', label: 'Villes couvertes' },
              { value: '24/7', label: 'Disponible' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-muted/30 border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">Processus simple</p>
            <h2 className="text-3xl font-bold text-foreground">Comment ça marche ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Saisissez l\'IMEI', desc: 'Tapez *#06# sur le téléphone ou entrez le numéro IMEI à vérifier', step: '01' },
              { icon: Zap, title: 'Analyse instantanée', desc: 'Notre système vérifie la base de données nationale en temps réel', step: '02' },
              { icon: CheckCircle, title: 'Résultat fiable', desc: 'Obtenez un score de risque précis et le statut du téléphone', step: '03' },
            ].map(({ icon: Icon, title, desc, step }) => (
              <div key={title} className="relative">
                <Card className="text-center border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card">
                  <CardContent className="pt-8 pb-6 px-6 space-y-4">
                    <div className="text-[10px] font-bold text-accent/40 uppercase tracking-widest">Étape {step}</div>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                      <Icon className="text-primary" size={24} />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">Fonctionnalités</p>
            <h2 className="text-3xl font-bold text-foreground">Pourquoi TracePhone ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Lock, title: 'Sécurité maximale', desc: 'Données cryptées et protégées. Collaboration directe avec les forces de l\'ordre du Bénin.', color: 'text-primary bg-primary/10' },
              { icon: Globe, title: 'Couverture nationale', desc: '12 villes couvertes avec un réseau de commissariats connectés à la plateforme.', color: 'text-success bg-success/10' },
              { icon: Users, title: 'Communauté active', desc: 'Rejoignez des milliers d\'utilisateurs qui protègent leurs appareils et combattent le recel.', color: 'text-accent bg-accent/10' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <Card key={title} className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6 pb-5 space-y-3">
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Card className="border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-10 md:p-14 rounded-2xl shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Prêt à protéger votre téléphone ?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
              Inscrivez-vous gratuitement et commencez à vérifier les téléphones dès maintenant.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-10 h-12 text-base shadow-lg">
                Créer un compte gratuit
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center">
              <Smartphone className="text-accent-foreground" size={14} />
            </div>
            <span className="font-semibold text-sm text-foreground">TracePhone Bénin</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TracePhone Bénin. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
