import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Target, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="benin-stripe" />
      <nav className="sticky top-0 z-30 border-b border-border/50 bg-card/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Accueil
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="text-primary-foreground" size={16} />
            </div>
            <span className="font-bold text-foreground">TraceIMEI-BJ</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">À propos de TraceIMEI-BJ</h1>
          <p className="text-muted-foreground text-lg">
            Une plateforme béninoise de vérification d'IMEI, conçue pour les dealers, les réparateurs et les particuliers.
          </p>
        </header>

        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold"><Target size={18} className="text-primary" /> Notre mission</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Réduire le commerce de téléphones volés au Bénin en offrant un outil simple, rapide et gratuit pour vérifier
              qu'un IMEI n'est pas signalé volé avant tout achat. Notre approche est <strong>réaliste</strong> : nous combinons
              une base de signalements communautaires, l'algorithme de Luhn et des règles de détection transparentes.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold"><Users size={18} className="text-accent" /> Pour qui ?</div>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
              <li><strong>Dealers</strong> (Missèbo, Dantokpa, Cadjehoun…) : vérifier la provenance avant l'achat.</li>
              <li><strong>Techniciens / réparateurs</strong> : tracer l'historique de réparation.</li>
              <li><strong>Particuliers</strong> : déclarer un vol, faire vérifier un téléphone d'occasion.</li>
              <li><strong>Enquêteurs / autorités</strong> : consulter les déclarations et générer des rapports.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold"><Award size={18} className="text-success" /> Notre approche</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              TraceIMEI-BJ utilise un <strong>moteur de scoring basé sur des règles transparentes</strong> (validation Luhn,
              cohérence TAC, fréquence des vérifications, signalements existants). Chaque décision est expliquée à l'utilisateur.
              Un modèle d'apprentissage automatique est en cours de développement et s'enrichit progressivement avec les
              données réelles validées par les administrateurs.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Projet issu d'un mémoire de licence soutenu chez GETECH (Cotonou, 2026).
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link to="/verify"><Button>Vérifier un IMEI</Button></Link>
          <Link to="/privacy"><Button variant="outline">Politique de confidentialité</Button></Link>
        </div>
      </main>
    </div>
  );
}
