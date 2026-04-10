import { useState } from 'react';
import { Shield, AlertTriangle, XCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerifyResult {
  status: 'safe' | 'suspect' | 'stolen';
  score: number;
  phone?: { brand: string; model: string; created_at: string; city: string };
  reportCount: number;
}

export default function VerifyIMEI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imei, setImei] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{15}$/.test(imei)) {
      toast({ title: 'Erreur', description: 'L\'IMEI doit contenir 15 chiffres.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);

    const { data: phones } = await supabase.from('stolen_phones').select('*').eq('imei', imei);
    const { data: checks } = await supabase.from('imei_checks').select('id').eq('imei', imei);

    const reportCount = phones?.length || 0;
    const checkCount = checks?.length || 0;

    let score = 0;
    if (reportCount > 0) {
      score += Math.min(reportCount * 30, 60);
      const latest = phones?.[0];
      if (latest) {
        const daysSince = Math.max(0, (Date.now() - new Date(latest.created_at).getTime()) / 86400000);
        score += daysSince < 30 ? 20 : daysSince < 90 ? 10 : 5;
      }
      score += Math.min(checkCount * 3, 15);
    } else {
      score = Math.min(checkCount * 2, 25);
    }
    score = Math.min(score, 100);

    let status: 'safe' | 'suspect' | 'stolen';
    if (score >= 70) status = 'stolen';
    else if (score >= 31) status = 'suspect';
    else status = 'safe';

    const verifyResult: VerifyResult = {
      status,
      score,
      reportCount,
      phone: phones && phones.length > 0 ? { brand: phones[0].brand, model: phones[0].model, created_at: phones[0].created_at, city: phones[0].city } : undefined,
    };

    if (user) {
      await supabase.from('imei_checks').insert({
        user_id: user.id,
        imei,
        result: status,
        risk_score: score,
      });
    }

    // Notify owner if IMEI is in stolen database
    if (reportCount > 0) {
      supabase.functions.invoke('notify-owner', {
        body: { imei, verifier_info: `Vérification depuis l'application` },
      }).catch(() => {}); // fire-and-forget
    }

    setResult(verifyResult);
    setLoading(false);
  };

  const statusConfig = {
    safe: { icon: Shield, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', label: 'TÉLÉPHONE SÉCURISÉ', barColor: 'bg-success' },
    suspect: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', label: 'TÉLÉPHONE SUSPECT', barColor: 'bg-warning' },
    stolen: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'TÉLÉPHONE VOLÉ', barColor: 'bg-destructive' },
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vérifier un IMEI</h2>
          <p className="text-muted-foreground">Vérifiez avant d'acheter. Protégez votre téléphone.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleVerify} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  value={imei}
                  onChange={e => setImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder="Entrer IMEI (15 chiffres)"
                  className="pl-10 font-mono"
                  maxLength={15}
                />
              </div>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {loading ? '...' : 'Vérifier'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className={`border-2 ${statusConfig[result.status].border} animate-fade-in`}>
            <CardContent className="pt-6 space-y-4">
              <div className={`flex items-center gap-3 ${statusConfig[result.status].color}`}>
                {(() => { const Icon = statusConfig[result.status].icon; return <Icon size={32} />; })()}
                <h3 className="text-xl font-bold">{statusConfig[result.status].label}</h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Score de risque</span>
                  <span className="font-bold text-foreground">{result.score}%</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${statusConfig[result.status].barColor}`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Signalé <strong className="text-foreground">{result.reportCount} fois</strong></p>
                {result.reportCount > 0 && (
                  <p className="text-xs text-accent">📧 Le propriétaire a été automatiquement notifié de cette vérification.</p>
                )}
                {result.phone && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <p><strong>Marque:</strong> {result.phone.brand}</p>
                    <p><strong>Modèle:</strong> {result.phone.model}</p>
                    <p><strong>Ville:</strong> {result.phone.city}</p>
                    <p><strong>Déclaré le:</strong> {new Date(result.phone.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
