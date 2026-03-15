import { UserParametersService } from "./userParameters";

export type LeadInput = {
  id: string;
  source?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  budget?: number | null;
  zone?: string | null;
  timeframe?: string | null;
  propertyType?: string | null;
  property_type?: string | null;
};

export type LeadWeights = {
  budget: number;
  zone: number;
  timeframe: number;
  source: number;
};

export type LeadScoringCriteria = {
  weights: LeadWeights;
  minimumBudget: number;
  idealBudget: number;
  optimumBudget: number;
  timeframeIdeal: string;
  priorityZones: string[];
};

type StoredLeadConfig = {
  weights?: unknown;
  minimumBudget?: unknown;
  idealBudget?: unknown;
  optimumBudget?: unknown;
  timeframeIdeal?: unknown;
  priorityZones?: unknown;
};

type BuildPromptInput = {
  leads: LeadInput[];
  criteria: LeadScoringCriteria;
};

const DEFAULT_WEIGHTS: LeadWeights = {
  budget: 3,
  zone: 3,
  timeframe: 3,
  source: 3,
};

const clampWeight = (value: number) => {
  if (!Number.isFinite(value)) return 3;
  if (value < 1) return 1;
  if (value > 5) return 5;
  return Math.round(value);
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const toString = (value: unknown, fallback = "") => {
  return typeof value === "string" ? value.trim() : fallback;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const toWeights = (weights: unknown): LeadWeights => {
  const source =
    weights && typeof weights === "object"
      ? (weights as Record<string, unknown>)
      : {};

  return {
    budget: clampWeight(toNumber(source.budget, DEFAULT_WEIGHTS.budget)),
    zone: clampWeight(toNumber(source.zone, DEFAULT_WEIGHTS.zone)),
    timeframe: clampWeight(
      toNumber(source.timeframe, DEFAULT_WEIGHTS.timeframe),
    ),
    source: clampWeight(toNumber(source.source, DEFAULT_WEIGHTS.source)),
  };
};

const normalizeCriteria = (raw: StoredLeadConfig): LeadScoringCriteria => {
  const minimumBudget = Math.max(0, Math.trunc(toNumber(raw.minimumBudget, 0)));
  const idealBudget = Math.max(
    minimumBudget,
    Math.trunc(toNumber(raw.idealBudget, minimumBudget)),
  );
  const optimumBudget = Math.max(
    idealBudget,
    Math.trunc(toNumber(raw.optimumBudget, idealBudget)),
  );

  return {
    weights: toWeights(raw.weights),
    minimumBudget,
    idealBudget,
    optimumBudget,
    timeframeIdeal: toString(raw.timeframeIdeal),
    priorityZones: toStringArray(raw.priorityZones),
  };
};

const normalizeLead = (lead: LeadInput) => {
  return {
    id: lead.id,
    name: toString(lead.name, "Sin nombre"),
    source: toString(lead.source, "desconocida"),
    email: toString(lead.email) || null,
    phone: toString(lead.phone) || null,
    budget: lead.budget ?? null,
    zone: toString(lead.zone) || null,
    timeframe: toString(lead.timeframe) || null,
    propertyType:
      toString(lead.propertyType) || toString(lead.property_type) || null,
  };
};

export async function getUserLeadCriteria(
  userId: string,
): Promise<LeadScoringCriteria | null> {
  const config = await UserParametersService.getLeadConfigByUserId(userId);
  if (!config) return null;

  return normalizeCriteria(config);
}

export function getPromptParameters(
  lead: LeadInput,
  criteria: LeadScoringCriteria,
) {
  return {
    lead: normalizeLead(lead),
    criteria,
  };
}

export function buildLeadScoringPrompt({ leads, criteria }: BuildPromptInput) {
  const normalizedLeads = leads.map(normalizeLead);

  return [
    "Eres un analista de leads para una inmobiliaria.",
    "Debes priorizar cada lead usando SOLAMENTE los criterios proporcionados por el usuario.",
    "",
    "Reglas importantes:",
    "1. Calcula un score entero entre 0 y 1000 por lead.",
    "2. Respeta los pesos del usuario (1 a 5): budget, zone, timeframe, source.",
    "3. Usa minimumBudget, idealBudget y optimumBudget para valorar presupuesto (están en Pesos Argentinos - ARS).",
    "4. Considera las priorityZones y timeframeIdeal como señales clave. Asume que las zonas pertenecen a ciudades de Argentina.",
    "5. Evalúa el contexto desde la perspectiva del mercado inmobiliario argentino (ej: valor del ARS, tipo de cambio, jerga).",
    "6. Si faltan datos en un lead, no inventes valores; penaliza razonablemente en el score.",
    "7. Responde SOLO JSON valido, sin markdown.",
    "",
    "Formato de salida esperado:",
    JSON.stringify(
      {
        results: [
          {
            leadId: "lead-id",
            score: 0,
            label: "hot|warm|cold",
            explanation: {
              budget: "string",
              zone: "string",
              timeframe: "string",
              source: "string",
              summary: "string",
            },
          },
        ],
      },
      null,
      2,
    ),
    "",
    "CRITERIOS DEL USUARIO:",
    JSON.stringify(criteria, null, 2),
    "",
    "LEADS A EVALUAR:",
    JSON.stringify(normalizedLeads, null, 2),
  ].join("\n");
}
