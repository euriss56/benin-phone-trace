// Rule-based risk scoring (no fake ML). Transparent and explainable.
// Each rule contributes a weight; total clamped to [0, 1].

import { isValidLuhn, lookupTac } from "./imei";

export type RiskLevel = "low" | "medium" | "high";
export type RiskStatus = "safe" | "suspect" | "stolen";

export interface RiskInput {
  imei: string;
  reportCount: number;          // # of times declared stolen
  recentChecks: number;         // # of checks for this IMEI in last 24h
  latestReportDaysAgo?: number; // days since latest theft report
  declaredBrand?: string;       // brand from stolen_phones if any
  declaredModel?: string;
}

export interface RiskRule {
  id: string;
  label: string;
  weight: number;     // contribution to score (0..1)
  triggered: boolean;
  severity: "info" | "warning" | "danger";
}

export interface RiskAssessment {
  score: number;           // 0..1
  scorePercent: number;    // 0..100 (rounded)
  level: RiskLevel;        // low / medium / high
  status: RiskStatus;      // safe / suspect / stolen
  rules: RiskRule[];       // explanations
  summary: string;         // user-facing one-liner
}

export function assessRisk(input: RiskInput): RiskAssessment {
  const rules: RiskRule[] = [];
  const luhnOk = isValidLuhn(input.imei);
  const tac = lookupTac(input.imei);

  // R1 — Luhn
  rules.push({
    id: "luhn",
    label: luhnOk
      ? "Format IMEI valide (algorithme de Luhn)"
      : "IMEI invalide selon l'algorithme de Luhn — possible saisie erronée ou IMEI falsifié",
    weight: luhnOk ? 0 : 0.4,
    triggered: !luhnOk,
    severity: luhnOk ? "info" : "danger",
  });

  // R2 — Reported as stolen
  if (input.reportCount > 0) {
    const w = Math.min(0.35 + (input.reportCount - 1) * 0.1, 0.6);
    rules.push({
      id: "reported",
      label: `Téléphone signalé volé ${input.reportCount} fois dans la base`,
      weight: w,
      triggered: true,
      severity: "danger",
    });
  } else {
    rules.push({
      id: "not_reported",
      label: "Aucun signalement de vol enregistré pour cet IMEI",
      weight: 0,
      triggered: false,
      severity: "info",
    });
  }

  // R3 — Recency of report
  if (input.reportCount > 0 && input.latestReportDaysAgo !== undefined) {
    if (input.latestReportDaysAgo < 30) {
      rules.push({
        id: "recent_report",
        label: `Signalement récent (il y a ${Math.floor(input.latestReportDaysAgo)} jour(s))`,
        weight: 0.15,
        triggered: true,
        severity: "danger",
      });
    } else if (input.latestReportDaysAgo < 90) {
      rules.push({
        id: "report_3m",
        label: "Signalement de moins de 3 mois",
        weight: 0.08,
        triggered: true,
        severity: "warning",
      });
    }
  }

  // R4 — Excessive recent checks (possible cloning attempts or reseller curiosity)
  if (input.recentChecks > 10) {
    rules.push({
      id: "many_checks",
      label: `Cet IMEI a été vérifié ${input.recentChecks} fois en 24h — comportement inhabituel`,
      weight: 0.12,
      triggered: true,
      severity: "warning",
    });
  } else if (input.recentChecks > 3) {
    rules.push({
      id: "some_checks",
      label: `${input.recentChecks} vérifications récentes pour cet IMEI`,
      weight: 0.05,
      triggered: true,
      severity: "warning",
    });
  }

  // R5 — TAC mismatch with declared brand
  if (tac && input.declaredBrand) {
    const matches = tac.brand.toLowerCase() === input.declaredBrand.toLowerCase();
    if (!matches) {
      rules.push({
        id: "tac_mismatch",
        label: `Incohérence : marque déclarée "${input.declaredBrand}" mais TAC indique "${tac.brand}"`,
        weight: 0.2,
        triggered: true,
        severity: "danger",
      });
    } else {
      rules.push({
        id: "tac_match",
        label: `Marque cohérente avec le TAC (${tac.brand})`,
        weight: 0,
        triggered: false,
        severity: "info",
      });
    }
  }

  // Aggregate
  const raw = rules.reduce((s, r) => s + r.weight, 0);
  const score = Math.min(Math.max(raw, 0), 1);
  const scorePercent = Math.round(score * 100);

  let level: RiskLevel;
  let status: RiskStatus;
  if (score >= 0.7) {
    level = "high";
    status = "stolen";
  } else if (score >= 0.31) {
    level = "medium";
    status = "suspect";
  } else {
    level = "low";
    status = "safe";
  }

  const summary =
    status === "stolen"
      ? "Risque élevé : ce téléphone est très probablement volé ou falsifié."
      : status === "suspect"
        ? "Risque modéré : prudence avant l'achat. Vérifiez la facture et l'identité du vendeur."
        : "Risque faible : aucun signalement majeur détecté. Vérifiez tout de même la facture.";

  return { score, scorePercent, level, status, rules, summary };
}
