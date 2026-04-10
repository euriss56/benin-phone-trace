import { useState, useRef } from 'react';
import { Shield, AlertTriangle, XCircle, Search, Info, Smartphone, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VerifyResult {
  status: 'safe' | 'suspect' | 'stolen';
  score: number;
  phone?: { brand: string; model: string; created_at: string; city: string; case_number: string };
  reportCount: number;
  imei: string;
}

const statusConfig = {
  safe: {
    icon: CheckCircle,
    label: 'Téléphone Sécurisé',
    sublabel: 'Aucun signalement trouvé pour cet IMEI',
    cardClass: 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10',
    iconClass: 'text-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    barColor: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  suspect: {
    icon: AlertTriangle,
    label: 'Téléphone Suspect',
    sublabel: 'Activité inhabituelle détectée, soyez prudent',
    cardClass: 'border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10',
    iconClass: 'text-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    barColor: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  stolen: {
    icon: XCircle,
    label: 'Téléphone Volé !',
    sublabel: 'Ce téléphone a été déclaré volé dans notre base de données',
    cardClass: 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10',
    iconClass: 'text-red-500',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    barColor: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

export default function VerifyIMEI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imei, setImei] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [history, setHistory] = useState<VerifyResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateIMEI = (value: string) => {
    if (value.length !== 15) return false;
    // Luhn algorithm check
    let sum = 0;
    let isEven = false;
    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const imeiValid = imei.length === 15;
  const imeiLuhn = imei.length === 15 && validateIMEI(imei);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imeiValid) {
      toast({ title: 'IMEI invalide', description: 'L\'IMEI doit contenir exactement 15 chiffres.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);

    const [{ data: phones }, { data: checks }] = await Promise.all([
      supabase.from('stolen_phones').select('*').eq('imei', imei),
      supabase.from('imei_checks').select('id').eq('imei', imei),
    ]);

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

    const status: 'safe' | 'suspect' | 'stolen' =
      score >= 70 ? 'stolen' : score >= 31 ? 'suspect' : 'safe';

    const verifyResult: VerifyResult = {
      status, score, reportCount, imei,
      phone: phones && phones.length > 0 ? {
        brand: phones[0].brand, model: phones[0].model,
        created_at: phones[0].created_at, city: phones[0].city,
        case_number: phones[0].case_number,
      } : undefined,
    };

    if (user) {
      await supabase.from('imei_checks').insert({
        user_id: user.id, imei, result: status, risk_score: score,
      });
    }

    if (reportCount > 0) {
      supabase.functions.invoke('notify-owner', { body: { imei, verifier_info: 'Vérification via TracePhone' } }).catch(() => {});
    }

    setResult(verifyResult);
    setHistory(prev => [verifyResult, ...prev].slice(0, 5));
    setLoading(false);
  };

  const handleImeiChange = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 15);
    setImei(clean);
    if (result) setResult(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vérifier un IMEI</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Vérifiez l'historique d'un téléphone avant de l'acheter ou de l'accepter
          </p>
        </div>

        {/* Search card */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
                  <Input
                    ref={inputRef}
                    value={imei}
                    onChange={e => handleImeiChange(e.target.value)}
                    placeholder="Entrez l'IMEI (15 chiffres)"
                    className={cn(
                      "pl-10 font-mono text-base h-12 transition-all",
                      imei.length === 15 && "border-emerald-400 dark:border-emerald-600 focus-visible:ring-emerald-400",
                      imei.length > 0 && imei.length < 15 && "border-amber-400 dark:border-amber-600 focus-visible:ring-amber-400"
                    )}
                    maxLength={15}
                  />
                  {imei.length > 0 && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-mono font-medium",
                        imei.length === 15 ? "text-emerald-500" : "text-muted-foreground"
                      )}>
                        {imei.length}/15
                      </span>
                    </div>
                  )}
                </div>

                {/* IMEI indicator */}
                <div className="flex gap-1">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-0.5 flex-1 rounded-full transition-all duration-200",
                        i < imei.length
                          ? imei.length === 15 ? "bg-emerald-500" : "bg-primary"
                          : "bg-border"
                      )}
                    />
                  ))}
                </div>

                {imei.length === 15 && (
                  <div className={cn(
                    "flex items-center gap-1.5 text-xs",
                    imeiLuhn ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  )}>
                    {imeiLuhn ? (
                      <><CheckCircle size={12} /> IMEI valide (vérification Luhn passée)</>
                    ) : (
                      <><AlertTriangle size={12} /> Format inhabituel — vérifiez l'IMEI</>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 gap-2 font-semibold"
                disabled={loading || imei.length !== 15}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Vérification en cours...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Vérifier cet IMEI
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 p-3 rounded-xl bg-muted/50 flex items-start gap-2">
              <Info size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Composez <span className="font-mono font-medium text-foreground">*#06#</span> sur votre téléphone pour obtenir l'IMEI. Il est aussi imprimé sous la batterie ou dans les paramètres.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (() => {
          const cfg = statusConfig[result.status];
          const Icon = cfg.icon;
          return (
            <Card className={cn("border-2 animate-scale-in shadow-sm", cfg.cardClass)}>
              <CardContent className="pt-6 space-y-5">
                {/* Status header */}
                <div className="flex items-start gap-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm", cfg.iconBg)}>
                    <Icon size={28} className={cfg.iconClass} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{cfg.label}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{cfg.sublabel}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">{result.imei}</p>
                  </div>
                </div>

                {/* Risk score */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Score de risque</span>
                    <span className={cn("font-bold text-base", cfg.iconClass)}>{result.score}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-1000", cfg.barColor)}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0% — Sûr</span>
                    <span>100% — Dangereux</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background/60 rounded-xl p-3 text-center border border-border/50">
                    <p className="text-2xl font-bold text-foreground">{result.reportCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Signalement{result.reportCount > 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-background/60 rounded-xl p-3 text-center border border-border/50">
                    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full", cfg.badgeClass)}>
                      <Icon size={11} />
                      {result.status === 'safe' ? 'Sûr' : result.status === 'suspect' ? 'À vérifier' : 'Volé'}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1.5">Statut</p>
                  </div>
                </div>

                {/* Phone details */}
                {result.phone && (
                  <div className="bg-background/60 rounded-xl border border-border/50 divide-y divide-border/50 overflow-hidden">
                    <div className="flex items-center gap-2 p-3">
                      <Smartphone size={14} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{result.phone.brand} {result.phone.model}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3">
                      <MapPin size={14} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{result.phone.city}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Déclaré le {new Date(result.phone.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                )}

                {result.reportCount > 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                    <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Le propriétaire déclarant a été automatiquement notifié de cette vérification.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Search history */}
        {history.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Clock size={14} />
                Recherches récentes (session)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.slice(1).map((h, i) => {
                  const cfg = statusConfig[h.status];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => { setImei(h.imei); setResult(h); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors text-left"
                    >
                      <Icon size={14} className={cfg.iconClass} />
                      <span className="font-mono text-sm text-foreground flex-1">{h.imei}</span>
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", cfg.badgeClass)}>
                        {h.score}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
