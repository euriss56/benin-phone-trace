import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Search, Smartphone, CheckCircle, Users, ArrowRight, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  { value: '10K+', label: 'IMEI vérifiés' },
  { value: '2K+', label: 'Téléphones signalés' },
  { value: '12', label: 'Villes couvertes' },
  { value: '98%', label: 'Taux de fiabilité' },
];

const features = [
  { icon: Search, title: 'Vérification instantanée', desc: 'Scannez l\'IMEI d\'un téléphone en quelques secondes avant tout achat', color: 'from-blue-500 to-indigo-500' },
  { icon: AlertTriangle, title: 'Déclaration simplifiée', desc: 'Signalez votre vol en 3 étapes et alertez automatiquement la police', color: 'from-red-500 to-orange-500' },
  { icon: Shield, title: 'Base de données nationale', desc: 'Accédez à la base de données officielle des téléphones volés au Bénin', color: 'from-emerald-500 to-teal-500' },
  { icon: Users, title: 'Réseau de confiance', desc: 'Collaborez avec les forces de l\'ordre et protégez la communauté', color: 'from-purple-500 to-pink-500' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top stripe */}
      <div className="benin-stripe" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
              <Smartphone className="text-white" size={18} />
            </div>
            <div>
              <span className="font-bold text-base text-foreground leading-none block">TracePhone</span>
              <span className="text-xs text-muted-foreground">Bénin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Connexion
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-primary border-0 text-white shadow-sm gap-1.5">
                S'inscrire
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold animate-fade-in">
            <Zap size={12} />
            Vérification IMEI instantanée · Bénin
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight animate-slide-up">
            Protégez-vous du{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              recel de téléphones
            </span>
            {' '}volés
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '150ms' }}>
            TracePhone Bénin est la plateforme nationale de traçabilité des téléphones volés. 
            Vérifiez avant d'acheter, déclarez vos vols et collaborez avec les autorités.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Link to="/register">
              <Button size="lg" className="gradient-primary border-0 text-white px-8 h-12 text-base shadow-lg gap-2 hover:opacity-90">
                Commencer gratuitement
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base gap-2">
                <Shield size={16} />
                Vérifier un IMEI
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
            {stats.map(({ value, label }) => (
              <div key={label} className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-colors">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Comment ça marche ?</h2>
            <p className="text-muted-foreground mt-2">Vérifiez ou déclarez en quelques étapes simples</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: Search, title: 'Saisissez l\'IMEI', desc: 'Entrez les 15 chiffres de l\'IMEI du téléphone à vérifier ou à déclarer volé', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { step: '02', icon: Shield, title: 'Analyse instantanée', desc: 'Notre système compare l\'IMEI avec la base de données nationale en temps réel', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { step: '03', icon: CheckCircle, title: 'Résultat fiable', desc: 'Recevez un score de risque détaillé et le statut exact du téléphone', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            ].map(({ step, icon: Icon, title, desc, color, bg }) => (
              <Card key={step} className="relative overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border/60">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                      <Icon className={color} size={22} />
                    </div>
                    <span className="text-5xl font-black text-muted-foreground/10 select-none">{step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-base">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground mt-2">Une plateforme complète pour lutter contre le vol de téléphones</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <Card key={title} className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border/60 overflow-hidden group">
                <CardContent className="pt-6 flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 overflow-hidden">
            <CardContent className="py-12 space-y-6">
              <div className="w-16 h-16 rounded-3xl gradient-primary mx-auto flex items-center justify-center shadow-lg">
                <Star className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Rejoignez la communauté</h2>
                <p className="text-muted-foreground mt-2">
                  Créez votre compte gratuitement et commencez à protéger vos appareils dès aujourd'hui
                </p>
              </div>
              <Link to="/register">
                <Button size="lg" className="gradient-primary border-0 text-white px-10 h-12 text-base shadow-lg gap-2 hover:opacity-90">
                  Créer mon compte
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Smartphone className="text-white" size={14} />
            </div>
            <span className="text-sm font-semibold text-foreground">TracePhone Bénin</span>
          </div>
          <div className="benin-stripe w-32 rounded-full" />
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} TracePhone Bénin. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
