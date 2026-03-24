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
  const provider = process.env.LLM_PROVIDER || "foundry";

  const prompt = buildLeadScoringPrompt({
    leads: [input.lead],
    criteria: input.criteria,
  });

  try {
    let rawContent = "";
    let modelUsed = "";

    const systemPrompt = "Eres un asistente experto en el mercado inmobiliario argentino que califica leads según criterios definidos. Todo presupuesto está en Dólares Estadounidenses (USD. A pesar de que la app esté destinada al mercado argentino, los presupuestos se manejan en dolares). Las zonas pertenecen a Argentina. Comporta tu análisis bajo la jerga y contexto local. Devuelve solo JSON valido.";

    if (provider === "foundry" || provider === "azure") {
      const endpoint = process.env.FOUNDRY_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
      const key = process.env.FOUNDRY_KEY || process.env.AZURE_OPENAI_KEY;

      if (!key || !endpoint) {
        throw new Error("Faltan credenciales de Microsoft Foundry (o Azure OpenAI).");
      }

      // Import dynamically to avoid loading openai if not used
      const { AzureOpenAI } = await import("openai");
      const azureClient = new AzureOpenAI({
        endpoint: endpoint,
        apiKey: key,
        apiVersion: "2024-05-01-preview",
        deployment: process.env.FOUNDRY_DEPLOYMENT || process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
      });

      const response = await azureClient.chat.completions.create({
        model: process.env.FOUNDRY_DEPLOYMENT || process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
        user: input.userId,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        stream: false,
      });

      rawContent = response.choices[0]?.message?.content || "";
      modelUsed = response.model || process.env.FOUNDRY_DEPLOYMENT || process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

    } else {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("Falta OPENROUTER_API_KEY en variables de entorno.");
      }

      const response = await openRouter.chat.send({
        chatGenerationParams: {
          model: DEFAULT_MODEL,
          user: input.userId,
          messages: [
            {
              role: "system",
              content: systemPrompt,
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

      rawContent = toTextContent(response.choices[0]?.message?.content);
      modelUsed = response.model || DEFAULT_MODEL;
    }

    if (!rawContent) {
      throw new Error("El modelo devolvio una respuesta vacia.");
    }

    const parsed = extractJson(rawContent);
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
      modelVersion: modelUsed,
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
