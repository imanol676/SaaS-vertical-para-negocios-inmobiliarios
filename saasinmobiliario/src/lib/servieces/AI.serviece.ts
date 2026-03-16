import { OpenRouter } from "@openrouter/sdk";
import { Prisma } from "@prisma/client";
import {
  buildLeadScoringPrompt,
  LeadInput,
  LeadScoringCriteria,
} from "./buildPrompt";
import { createLeadScoring } from "./createScoring";

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

type LeadScoreExplanation = {
  budget?: string;
  zone?: string;
  timeframe?: string;
  source?: string;
  summary?: string;
  [key: string]: unknown;
};

type LeadScoreResult = {
  leadId: string;
  score: number;
  label: string;
  explanation: LeadScoreExplanation;
};

type ScoreLeadWithAIInput = {
  lead: LeadInput;
  criteria: LeadScoringCriteria;
  userId: string;
};

const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet";

const extractJson = (rawContent: string) => {
  try {
    return JSON.parse(rawContent) as unknown;
  } catch {
    const objectMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      throw new Error("La respuesta del modelo no contiene JSON valido.");
    }

    return JSON.parse(objectMatch[0]) as unknown;
  }
};

const toTextContent = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const text = (item as { text?: unknown }).text;
        return typeof text === "string" ? text : "";
      })
      .join("\n")
      .trim();
  }

  return "";
};

const parseLeadResults = (payload: unknown): LeadScoreResult[] => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload invalido del modelo.");
  }

  const results = (payload as { results?: unknown }).results;
  if (!Array.isArray(results)) {
    throw new Error("La respuesta no contiene el arreglo 'results'.");
  }

  return results
    .filter((item): item is Record<string, unknown> => {
      return !!item && typeof item === "object";
    })
    .map((item) => ({
      leadId: typeof item.leadId === "string" ? item.leadId : "",
      score: Number(item.score),
      label: typeof item.label === "string" ? item.label : "cold",
      explanation:
        item.explanation && typeof item.explanation === "object"
          ? (item.explanation as LeadScoreExplanation)
          : { summary: "Sin explicacion" },
    }))
    .filter((item) => item.leadId.length > 0 && Number.isFinite(item.score));
};

export async function scoreLeadWithAI(
  input: ScoreLeadWithAIInput,
): Promise<{
  score: number;
  label: string;
  explanation: LeadScoreExplanation;
} | null> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Falta OPENROUTER_API_KEY en variables de entorno.");
  }

  const prompt = buildLeadScoringPrompt({
    leads: [input.lead],
    criteria: input.criteria,
  });

  try {
    const response = await openRouter.chat.send({
      chatGenerationParams: {
        model: DEFAULT_MODEL,
        user: input.userId,
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente experto en el mercado inmobiliario argentino que califica leads según criterios definidos. Todo presupuesto está en Pesos Argentinos (ARS) y las zonas pertenecen a Argentina. Comporta tu análisis bajo la jerga y contexto local. Devuelve solo JSON valido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        maxTokens: 1500,
        stream: false,
      },
    });

    if (!("choices" in response)) {
      throw new Error("Respuesta inesperada del SDK de OpenRouter.");
    }

    const content = toTextContent(response.choices[0]?.message?.content);
    if (!content) {
      throw new Error("El modelo devolvio una respuesta vacia.");
    }

    const parsed = extractJson(content);
    const results = parseLeadResults(parsed);
    const leadResult =
      results.find((result) => result.leadId === input.lead.id) ||
      results[0] ||
      null;

    if (!leadResult) {
      console.error(
        "No se encontró el resultado para el lead en la respuesta del modelo.",
      );
      return null;
    }

    // Guardamos el resultado en la base de datos
    await createLeadScoring({
      leadId: input.lead.id,
      score: leadResult.score,
      label: leadResult.label,
      explanation: leadResult.explanation as Prisma.InputJsonValue,
      modelVersion: response.model || DEFAULT_MODEL,
    });

    return {
      score: leadResult.score,
      label: leadResult.label,
      explanation: leadResult.explanation,
    };
  } catch (error) {
    console.error("Error al calificar el lead con AI:", error);
    return null;
  }
}
