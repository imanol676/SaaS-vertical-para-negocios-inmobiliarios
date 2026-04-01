export const PLANS = {
  starter: {
    id: "starter" as const,
    name: "Plan Starter",
    priceARS: Number(process.env.NEXT_PUBLIC_PLAN_STARTER_PRICE || process.env.PLAN_STARTER_PRICE || 29990),
    priceLabel: process.env.NEXT_PUBLIC_PLAN_STARTER_LABEL || "$29.990",
    description: "Perfecto para comenzar",
    popular: false,
    features: {
      maxLeads: 200,
      maxProperties: 30,
      maxUsers: 1,
      maxAiScorings: 50,
      sheetsImport: true,
      prioritySupport: false,
    },
    featuresList: [
      "Hasta 200 leads/mes",
      "Hasta 30 propiedades",
      "1 usuario incluido",
      "50 scorings IA/mes",
      "Importación Google Sheets",
      "Soporte por email",
    ],
  },
  pro: {
    id: "pro" as const,
    name: "Plan Pro",
    priceARS: Number(process.env.NEXT_PUBLIC_PLAN_PRO_PRICE || process.env.PLAN_PRO_PRICE || 59990),
    priceLabel: process.env.NEXT_PUBLIC_PLAN_PRO_LABEL || "$59.990",
    description: "Para equipos en crecimiento",
    popular: true,
    features: {
      maxLeads: 1_000,
      maxProperties: 150,
      maxUsers: 5,
      maxAiScorings: 300,
      sheetsImport: true,
      prioritySupport: true,
    },
    featuresList: [
      "Hasta 1.000 leads/mes",
      "Hasta 150 propiedades",
      "5 usuarios incluidos",
      "300 scorings IA/mes",
      "Importación Google Sheets",
      "Soporte prioritario",
    ],
  },
  enterprise: {
    id: "enterprise" as const,
    name: "Plan Empresarial",
    priceARS: Number(process.env.NEXT_PUBLIC_PLAN_ENTERPRISE_PRICE || process.env.PLAN_ENTERPRISE_PRICE || 119990),
    priceLabel: process.env.NEXT_PUBLIC_PLAN_ENTERPRISE_LABEL || "$119.990",
    description: "Para inmobiliarias grandes",
    popular: false,
    features: {
      maxLeads: 5_000,
      maxProperties: 500,
      maxUsers: 15,
      maxAiScorings: 1_500,
      sheetsImport: true,
      prioritySupport: true,
    },
    featuresList: [
      "Hasta 5.000 leads/mes",
      "Hasta 500 propiedades",
      "15 usuarios incluidos",
      "1.500 scorings IA/mes",
      "Importación Google Sheets",
      "Soporte prioritario y dedicado",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export type PlanConfig = (typeof PLANS)[PlanId];

export function getPlan(planId: string) {
  return PLANS[planId as PlanId] ?? null;
}

export function getPlanLimits(planId: string) {
  const plan = getPlan(planId);
  return plan?.features ?? PLANS.starter.features;
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLimit(value: number): string {
  if (value === Infinity) return "Ilimitados";
  return new Intl.NumberFormat("es-AR").format(value);
}
