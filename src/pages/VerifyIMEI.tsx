import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, XCircle, Search, Info, Lock, MapPinOff, CheckCircle2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isValidLuhn, lookupTac, formatImei } from '@/lib/imei';
import { assessRisk, type RiskAssessment } from '@/lib/riskScore';
import { checkRate, recordCheck, cacheVerification, getCachedVerification } from '@/lib/rateLimit';

interface VerifyResult extends RiskAssessment {
  phone?: { brand: string; model: string; created_at: string; city: string };
  reportCount: number;
  tacBrand?: string;
  tacModel?: string;
  fromCache?: boolean;
}

export default function VerifyIMEI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imei, setImei] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [imeiError, setImeiError] = useState('');
  const [luhnHint, setLuhnHint] = useState<'ok' | 'bad' | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const handleImeiChange = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 15);
    setImei(clean);
    if (clean.length === 0) { setImeiError(''); setLuhnHint(null); return; }
    if (clean.length < 15) { setImeiError(`${15 - clean.length} chiffres restants`); setLuhnHint(null); return; }
    setImeiError('');
    setLuhnHint(isValidLuhn(clean) ? 'ok' : 'bad');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{15}$/.test(imei)) {
      toast({ title: 'Erreur', description: "L'IMEI doit contenir 15 chiffres.", variant: 'destructive' });
      return;
    }

    // Rate limit (client-side)
    const rate = await checkRate();
    if (!rate.allowed) {
      const min = Math.ceil(rate.retryAfterSec / 60);
      toast({
        title: 'Limite atteinte',
        description: `Trop de vérifications. Réessayez dans ~${min} min.`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    const tac = lookupTac(imei);

    // Offline fallback
    if (!isOnline) {
      const cached = await getCachedVerification(imei);
      if (cached) {
        const assessment = assessRisk({ imei, reportCount: cached.status === 'stolen' ? 1 : 0, recentChecks: 0 });
        setResult({ ...assessment, reportCount: cached.status === 'stolen' ? 1 : 0, tacBrand: tac?.brand, tacModel: tac?.model, fromCache: true });
        setLoading(false);
        return;
      }
      toast({ title: 'Hors ligne', description: 'Aucune vérification en cache pour cet IMEI.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const since24h = new Date(Date.now() - 86400000).toISOString();
    const [{ data: phones }, { data: checks }] = await Promise.all([
      supabase.from('stolen_phones').select('*').eq('imei', imei).order('created_at', { ascending: false }),
      supabase.from('imei_checks').select('id,checked_at').eq('imei', imei).gte('checked_at', since24h),
    ]);

    const reportCount = phones?.length || 0;
    const recentChecks = checks?.length || 0;
    const latest = phones?.[0];
    const latestReportDaysAgo = latest
      ? (Date.now() - new Date(latest.created_at).getTime()) / 86400000
      : undefined;

    const assessment = assessRisk({
      imei,
      reportCount,
      recentChecks,
      latestReportDaysAgo,
      declaredBrand: latest?.brand,
      declaredModel: latest?.model,
    });

    const verifyResult: VerifyResult = {
      ...assessment,
      reportCount,
      phone: latest ? { brand: latest.brand, model: latest.model, created_at: latest.created_at, city: latest.city } : undefined,
      tacBrand: tac?.brand,
      tacModel: tac?.model,
    };

    await recordCheck();
    await cacheVerification({
      imei, status: assessment.status, scorePercent: assessment.scorePercent,
      cachedAt: Date.now(), brand: tac?.brand, model: tac?.model,
    });

    if (user) {
      await supabase.from('imei_checks').insert({
        user_id: user.id, imei, result: assessment.status, risk_score: assessment.scorePercent,
      });
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
    safe: { icon: Shield, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', label: '✅ TÉLÉPHONE LÉGITIME', barColor: 'bg-success', gradient: 'from-success/20 to-success/5' },
    suspect: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', label: '⚠️ TÉLÉPHONE SUSPECT', barColor: 'bg-warning', gradient: 'from-warning/20 to-warning/5' },
    stolen: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: '❌ TÉLÉPHONE SIGNALÉ VOLÉ', barColor: 'bg-destructive', gradient: 'from-destructive/20 to-destructive/5' },
  };

  const levelLabel = { low: 'Faible', medium: 'Moyen', high: 'Élevé' } as const;
  const sevColor = { info: 'text-success', warning: 'text-warning', danger: 'text-destructive' } as const;

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vérifier un IMEI</h2>
          <p className="text-muted-foreground text-sm mt-1">Vérifiez si un téléphone est légitime avant de l'acheter.</p>
        </div>

        {/* Trust banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            <MapPinOff size={14} className="text-success shrink-0" /> Aucun tracking GPS
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            <Lock size={14} className="text-success shrink-0" /> Données chiffrées
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            <CheckCircle2 size={14} className="text-success shrink-0" /> Loi 2017-20 (Bénin)
          </div>
        </div>

        {!isOnline && (
          <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
            <WifiOff size={14} /> Mode hors ligne — seules les vérifications en cache sont disponibles.
          </div>
        )}

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
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </div>
                {imeiError && <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1"><Info size={12} />{imeiError}</p>}
                {luhnHint === 'ok' && <p className="text-xs text-success mt-1.5 flex items-center gap-1"><CheckCircle2 size={12} />Format valide (Luhn)</p>}
                {luhnHint === 'bad' && <p className="text-xs text-destructive mt-1.5 flex items-center gap-1"><XCircle size={12} />Format invalide (Luhn) — vérifiez la saisie</p>}
                <p className="text-xs text-muted-foreground mt-1.5">💡 Tapez <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">*#06#</code> sur le téléphone pour obtenir l'IMEI</p>
              </div>
              <Button type="submit" className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading || imei.length !== 15}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    Vérification...
                  </div>
                ) : "Vérifier l'IMEI"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className={`border-2 ${statusConfig[result.status].border} animate-fade-in overflow-hidden relative`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${statusConfig[result.status].gradient} pointer-events-none`} />
            <CardContent className="pt-6 space-y-5 relative">
              <div className={`flex items-center gap-3 ${statusConfig[result.status].color}`}>
                {(() => { const Icon = statusConfig[result.status].icon; return <div className={`w-12 h-12 rounded-xl ${statusConfig[result.status].bg} flex items-center justify-center`}><Icon size={24} /></div>; })()}
                <div>
                  <h3 className="text-lg font-bold">{statusConfig[result.status].label}</h3>
                  <p className="text-xs text-muted-foreground">
                    Score {result.score.toFixed(2)} / 1.00 — Niveau <strong>{levelLabel[result.level]}</strong>
                    {result.fromCache && ' • depuis le cache'}
                  </p>
                </div>
              </div>

              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${statusConfig[result.status].barColor}`}
                  style={{ width: `${result.scorePercent}%` }}
                />
              </div>

              <p className="text-sm text-foreground font-medium">{result.summary}</p>

              {/* Detected device */}
              {(result.tacBrand || result.phone) && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Appareil identifié</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">IMEI :</span> <strong className="font-mono text-foreground">{formatImei(imei)}</strong></div>
                    {result.tacBrand && <div><span className="text-muted-foreground">Marque (TAC) :</span> <strong className="text-foreground">{result.tacBrand}</strong></div>}
                    {result.tacModel && <div><span className="text-muted-foreground">Modèle (TAC) :</span> <strong className="text-foreground">{result.tacModel}</strong></div>}
                    {result.phone && <div><span className="text-muted-foreground">Ville signalée :</span> <strong className="text-foreground">{result.phone.city}</strong></div>}
                  </div>
                  {!result.tacBrand && (
                    <p className="text-[11px] text-muted-foreground">TAC non répertorié dans notre base locale — c'est normal pour beaucoup d'appareils.</p>
                  )}
                </div>
              )}

              {/* Explanations */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pourquoi ce score ?</p>
                <ul className="space-y-1.5">
                  {result.rules.map(r => (
                    <li key={r.id} className="flex items-start gap-2 text-sm">
                      {r.severity === 'danger' && <XCircle size={14} className={`${sevColor.danger} mt-0.5 shrink-0`} />}
                      {r.severity === 'warning' && <AlertTriangle size={14} className={`${sevColor.warning} mt-0.5 shrink-0`} />}
                      {r.severity === 'info' && <CheckCircle2 size={14} className={`${sevColor.info} mt-0.5 shrink-0`} />}
                      <span className="text-foreground/90">{r.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.reportCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 px-3 py-2 rounded-lg">
                  <Info size={14} />
                  Le propriétaire déclaré a été automatiquement notifié de cette vérification.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
