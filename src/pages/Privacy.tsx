import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, Eye, FileText, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Privacy() {
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

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Politique de confidentialité</h1>
          <p className="text-sm text-muted-foreground">
            Conforme à la <strong>loi béninoise n° 2017-20</strong> du 20 avril 2018 portant code du numérique en
            République du Bénin (titre relatif à la protection des données à caractère personnel).
          </p>
        </header>

        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold"><Eye size={18} className="text-primary" /> 1. Données collectées</div>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
              <li>Informations de compte : nom, téléphone, email, marché de référence, type d'activité.</li>
              <li>Vérifications IMEI : numéro IMEI saisi, résultat, score, horodatage, identifiant utilisateur.</li>
              <li>Déclarations de vol : IMEI, marque/modèle, ville, date, photos optionnelles.</li>
              <li>Données techniques minimales nécessaires au fonctionnement (logs serveur).</li>
            </ul>
            <p className="text-xs text-muted-foreground italic">
              Nous ne collectons <strong>aucune donnée de géolocalisation GPS</strong> ni de SMS/contacts.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold"><FileText size={18} className="text-accent" /> 2. Finalités du traitement</div>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
              <li>Vérifier si un téléphone est signalé volé.</li>
              <li>Améliorer la qualité du moteur de détection (analyse statistique).</li>
              <li>Notifier le propriétaire déclaré quand son IMEI est vérifié.</li>
              <li>Permettre aux autorités habilitées d'instruire les signalements.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold"><Lock size={18} className="text-success" /> 3. Sécurité</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Les données sont stockées sur une infrastructure sécurisée avec chiffrement en transit (TLS) et au repos.
              L'accès est contrôlé par authentification et politiques de sécurité au niveau base de données (Row-Level Security).
              Seuls les administrateurs habilités peuvent consulter les données agrégées.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-3">
            <div className="text-foreground font-semibold">4. Vos droits</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conformément à la loi 2017-20, vous disposez d'un droit d'accès, de rectification, d'opposition,
              d'effacement et de portabilité de vos données. Vous pouvez exercer ces droits en nous contactant
              à l'adresse ci-dessous. Vous pouvez également saisir l'<strong>APDP</strong> (Autorité de Protection
              des Données Personnelles du Bénin).
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-3">
            <div className="text-foreground font-semibold">5. Conservation</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vérifications : 24 mois. Déclarations de vol : conservées tant que le statut reste actif puis archivées
              5 ans à des fins probatoires. Comptes inactifs : suppression sur demande.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold"><Mail size={18} /> 6. Contact</div>
            <p className="text-sm text-muted-foreground">
              Pour toute question : <strong>contact@traceimei-bj.org</strong> — GETECH, Cotonou, Bénin.
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center pt-4">
          Dernière mise à jour : avril 2026.
        </p>
      </main>
    </div>
  );
}
