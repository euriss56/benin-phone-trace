import { useState } from 'react';
import { Shield, AlertTriangle, XCircle, Search, Info } from 'lucide-react';
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
  const [imeiError, setImeiError] = useState('');

  const validateImei = (value: string) => {
    if (value.length === 0) { setImeiError(''); return; }
    if (value.length < 15) { setImeiError(`${15 - value.length} chiffres restants`); return; }
    setImeiError('');
  };

  const handleImeiChange = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 15);
    setImei(clean);
    validateImei(clean);
  };

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
      status, score, reportCount,
      phone: phones && phones.length > 0 ? { brand: phones[0].brand, model: phones[0].model, created_at: phones[0].created_at, city: phones[0].city } : undefined,
    };

    if (user) {
      await supabase.from('imei_checks').insert({ user_id: user.id, imei, result: status, risk_score: score });
    }

    if (reportCount > 0) {
      supabase.functions.invoke('notify-owner', {
        body: { imei, verifier_info: `Vérification depuis l'application` },
      }).catch(() => {});
    }

    setResult(verifyResult);
    setLoading(false);
  };

  const statusConfig = {
    safe: { icon: Shield, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', label: 'TÉLÉPHONE SÉCURISÉ', barColor: 'bg-success', gradient: 'from-success/20 to-success/5' },
    suspect: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', label: 'TÉLÉPHONE SUSPECT', barColor: 'bg-warning', gradient: 'from-warning/20 to-warning/5' },
    stolen: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'TÉLÉPHONE VOLÉ', barColor: 'bg-destructive', gradient: 'from-destructive/20 to-destructive/5' },
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vérifier un IMEI</h2>
          <p className="text-muted-foreground text-sm mt-1">Vérifiez si un téléphone a été déclaré volé avant de l'acheter.</p>
        </div>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    value={imei}
                    onChange={e => handleImeiChange(e.target.value)}
                    placeholder="Entrer le numéro IMEI (15 chiffres)"
                    className="pl-10 font-mono h-12 text-base"
                    maxLength={15}
                  />
                </div>
                {imeiError && <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1"><Info size={12} />{imeiError}</p>}
                <p className="text-xs text-muted-foreground mt-1.5">💡 Tapez <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">*#06#</code> sur le téléphone pour obtenir l'IMEI</p>
              </div>
              <Button type="submit" className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading || imei.length !== 15}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    Vérification...
                  </div>
                ) : 'Vérifier l\'IMEI'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className={`border-2 ${statusConfig[result.status].border} animate-fade-in overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${statusConfig[result.status].gradient} pointer-events-none`} />
            <CardContent className="pt-6 space-y-5 relative">
              <div className={`flex items-center gap-3 ${statusConfig[result.status].color}`}>
                {(() => { const Icon = statusConfig[result.status].icon; return <div className={`w-12 h-12 rounded-xl ${statusConfig[result.status].bg} flex items-center justify-center`}><Icon size={24} /></div>; })()}
                <div>
                  <h3 className="text-lg font-bold">{statusConfig[result.status].label}</h3>
                  <p className="text-xs text-muted-foreground">Score de risque: {result.score}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${statusConfig[result.status].barColor}`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Signalé <strong className="text-foreground">{result.reportCount} fois</strong> dans la base</p>
                {result.reportCount > 0 && (
                  <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 px-3 py-2 rounded-lg">
                    <Info size={14} />
                    Le propriétaire a été automatiquement notifié de cette vérification.
                  </div>
                )}
                {result.phone && (
                  <div className="bg-muted/50 rounded-xl p-4 space-y-2 mt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Détails du téléphone</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Marque:</span> <strong className="text-foreground">{result.phone.brand}</strong></div>
                      <div><span className="text-muted-foreground">Modèle:</span> <strong className="text-foreground">{result.phone.model}</strong></div>
                      <div><span className="text-muted-foreground">Ville:</span> <strong className="text-foreground">{result.phone.city}</strong></div>
                      <div><span className="text-muted-foreground">Déclaré le:</span> <strong className="text-foreground">{new Date(result.phone.created_at).toLocaleDateString('fr-FR')}</strong></div>
                    </div>
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
