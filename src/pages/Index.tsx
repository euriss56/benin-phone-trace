import { Link } from 'react-router-dom';
import { Shield, Search, Smartphone, CheckCircle, ArrowRight, Zap, ShoppingBag, Wrench, BadgeCheck, BarChart3 } from 'lucide-react';
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
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Shield className="text-primary-foreground" size={18} />
            </div>
            <div>
              <span className="font-bold text-base text-foreground tracking-tight">TraceIMEI-BJ</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Shield size={14} />
            Authentifier. Protéger. Tracer.
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
            TraceIMEI-BJ —{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Protégez vos téléphones
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            La première plateforme ML de traçabilité des téléphones volés au Bénin. Pour dealers, ateliers de réparation et forces de l'ordre.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/verify">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 shadow-lg shadow-primary/20 h-12 text-base">
                Vérifier un IMEI gratuitement
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base border-border/60">
                Créer un compte
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto pt-8">
            {[
              { value: '10,9M', label: 'Abonnés mobiles (ARCEP 2025)' },
              { value: 'Luhn', label: 'Validation IMEI standard' },
              { value: '< 2s', label: 'Temps de réponse moyen' },
              { value: 'Open', label: 'Modèle en apprentissage continu' },
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
              { icon: Smartphone, title: 'Saisissez ou scannez l\'IMEI', desc: 'Tapez *#06# sur le téléphone pour obtenir le numéro IMEI à 15 chiffres', step: '📱' },
              { icon: Zap, title: 'Analyse transparente', desc: 'Validation Luhn, lookup TAC, recoupement avec les déclarations de vol — chaque règle est expliquée', step: '🔎' },
              { icon: CheckCircle, title: 'Résultat immédiat', desc: 'Statut tricolore (vert/orange/rouge) avec score 0–1 et explications détaillées', step: '🎯' },
            ].map(({ icon: Icon, title, desc, step }) => (
              <div key={title} className="relative">
                <Card className="text-center border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card">
                  <CardContent className="pt-8 pb-6 px-6 space-y-4">
                    <div className="text-3xl">{step}</div>
                    <h3 className="font-semibold text-foreground text-lg">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">Pour qui ?</p>
            <h2 className="text-3xl font-bold text-foreground">Une plateforme pour tous les acteurs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShoppingBag, title: 'Dealers', desc: 'Vérifiez avant d\'acheter, protégez votre business et obtenez votre badge Dealer Traçable ARCEP.', color: 'text-primary bg-primary/10' },
              { icon: Wrench, title: 'Techniciens Atelier', desc: 'Enregistrez vos réparations, construisez la traçabilité et détectez les anomalies.', color: 'text-success bg-success/10' },
              { icon: BarChart3, title: 'ARCEP / Police', desc: 'Cartographiez les incidents, générez des rapports d\'activité et analysez les tendances.', color: 'text-accent bg-accent/10' },
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
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Prêt à sécuriser vos transactions ?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
              Rejoignez les dealers et techniciens de Missèbo, Dantokpa et Cadjehoun qui utilisent déjà TraceIMEI-BJ.
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
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <Shield className="text-primary-foreground" size={14} />
              </div>
              <span className="font-semibold text-sm text-foreground">TraceIMEI-BJ</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">À propos</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link>
              <Link to="/verify" className="hover:text-foreground transition-colors">Vérifier un IMEI</Link>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">Développé par Euriss FANOU — GETECH Cotonou 2026</p>
            <p className="text-xs text-muted-foreground">Données traitées conformément à la loi béninoise n° 2017-20</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
