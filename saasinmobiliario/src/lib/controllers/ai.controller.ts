import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "../prisma";
import { getUserLeadCriteria, LeadInput } from "../servieces/buildPrompt";
import { scoreLeadWithAI } from "../servieces/AI.serviece";

type PrioritizeLeadsRequestBody = {
  leads?: LeadInput[];
  leadIds?: string[];
  maxLeads?: number;
};

type PrioritizedLead = {
  leadId: string;
  score: number;
  label: string;
  explanation: unknown;
};

type LeadScoringHistoryItem = {
  id: string;
  leadId: string;
  leadName: string;
  leadSource: string;
  score: number;
  label: string;
  explanation: unknown;
  modelVersion: string;
  createdAt: string;
};

const MAX_LEADS_LIMIT = 100;
const DEFAULT_HISTORY_LIMIT = 50;

const normalizeMaxLeads = (value: unknown): number | undefined => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  if (value <= 0) return undefined;
  return Math.min(Math.trunc(value), MAX_LEADS_LIMIT);
};

const normalizeHistoryLimit = (value: string | null): number => {
  if (!value) return DEFAULT_HISTORY_LIMIT;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_HISTORY_LIMIT;
  }

  return Math.min(Math.trunc(parsed), MAX_LEADS_LIMIT);
};

const normalizeLeadIds = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;

  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return normalized.length > 0 ? normalized : undefined;
};

const normalizeInputLeads = (value: unknown): LeadInput[] | undefined => {
  if (!Array.isArray(value)) return undefined;

  const normalized = value
    .filter((item): item is Record<string, unknown> => {
      return !!item && typeof item === "object";
    })
    .map((item) => {
      const id = typeof item.id === "string" ? item.id.trim() : "";
      if (!id) return null;

      return {
        id,
        source: typeof item.source === "string" ? item.source : null,
        name: typeof item.name === "string" ? item.name : null,
        email: typeof item.email === "string" ? item.email : null,
        phone: typeof item.phone === "string" ? item.phone : null,
        budget: typeof item.budget === "number" ? item.budget : null,
        zone: typeof item.zone === "string" ? item.zone : null,
        timeframe: typeof item.timeframe === "string" ? item.timeframe : null,
        propertyType:
          typeof item.propertyType === "string" ? item.propertyType : null,
        property_type:
          typeof item.property_type === "string" ? item.property_type : null,
      } as LeadInput;
    })
    .filter((lead): lead is LeadInput => lead !== null);

  return normalized.length > 0 ? normalized : undefined;
};

const parseRequestBody = async (
  req: NextRequest,
): Promise<PrioritizeLeadsRequestBody> => {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    return {
      leads: normalizeInputLeads(body?.leads),
      leadIds: normalizeLeadIds(body?.leadIds),
      maxLeads: normalizeMaxLeads(body?.maxLeads),
    };
  } catch {
    return {};
  }
};

const mapLeadFromDb = (lead: {
  id: string;
  source: string;
  name: string;
  email: string | null;
  phone: string | null;
  budget: { toNumber: () => number } | null;
  zone: string | null;
  timeframe: string | null;
  property_type: string | null;
}): LeadInput => {
  return {
    id: lead.id,
    source: lead.source,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    budget: lead.budget ? lead.budget.toNumber() : null,
    zone: lead.zone,
    timeframe: lead.timeframe,
    property_type: lead.property_type,
  };
};

const getOrganizationLeads = async (
  orgClerkId: string,
  leadIds?: string[],
  maxLeads?: number,
): Promise<LeadInput[]> => {
  const organization = await prisma.organizations.findUnique({
    where: { clerk_org_id: orgClerkId },
    select: { id: true },
  });

  if (!organization) {
    throw new Error("Organización no encontrada");
  }

  const leads = await prisma.leads.findMany({
    where: {
      organization_id: organization.id,
      ...(leadIds ? { id: { in: leadIds } } : {}),
    },
    orderBy: { created_at: "desc" },
    ...(maxLeads ? { take: maxLeads } : {}),
  });

  return leads.map(mapLeadFromDb);
};

const getLeadScoringHistory = async (
  orgClerkId: string,
  limit: number,
): Promise<LeadScoringHistoryItem[]> => {
  const organization = await prisma.organizations.findUnique({
    where: { clerk_org_id: orgClerkId },
    select: { id: true },
  });

  if (!organization) {
    throw new Error("Organización no encontrada");
  }

  const rows = await prisma.leadScores.findMany({
    where: {
      lead: {
        organization_id: organization.id,
      },
    },
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          source: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    leadId: row.lead_id,
    leadName: row.lead.name,
    leadSource: row.lead.source,
    score: row.score,
    label: row.label,
    explanation: row.explanation,
    modelVersion: row.model_version,
    createdAt: row.created_at.toISOString(),
  }));
};

export class AIController {
  static async listScoringHistory(req: NextRequest) {
    try {
      const { userId, orgId } = await auth();

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!orgId) {
        return NextResponse.json(
          {
            error:
              "No hay organización activa en Clerk. Completa primero el formulario de creación de organización de Clerk.",
          },
          { status: 400 },
        );
      }

      const { searchParams } = new URL(req.url);
      const limit = normalizeHistoryLimit(searchParams.get("limit"));
      const history = await getLeadScoringHistory(orgId, limit);

      return NextResponse.json(
        {
          items: history,
          total: history.length,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error listando historial de scoring:", error);

      const message = error instanceof Error ? error.message : "Unknown error";
      if (message === "Organización no encontrada") {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      return NextResponse.json(
        {
          error: "No se pudo obtener el historial de scoring",
          details: process.env.NODE_ENV === "development" ? message : undefined,
        },
        { status: 500 },
      );
    }
  }

  static async prioritizeLeads(req: NextRequest) {
    try {
      const { userId, orgId } = await auth();

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!orgId) {
        return NextResponse.json(
          {
            error:
              "No hay organización activa en Clerk. Completa primero el formulario de creación de organización de Clerk.",
          },
          { status: 400 },
        );
      }

      const body = await parseRequestBody(req);

      const criteria = await getUserLeadCriteria(userId);
      if (!criteria) {
        return NextResponse.json(
          {
            error:
              "No hay criterios de priorización configurados. Configúralos en la sección Prompt.",
          },
          { status: 400 },
        );
      }

      const leadsToProcess =
        body.leads && body.leads.length > 0
          ? body.leads
          : await getOrganizationLeads(orgId, body.leadIds, body.maxLeads);

      if (leadsToProcess.length === 0) {
        return NextResponse.json(
          {
            processed: 0,
            succeeded: 0,
            failed: 0,
            results: [],
            failedLeadIds: [],
          },
          { status: 200 },
        );
      }

      const processedResults = await Promise.all(
        leadsToProcess.map(async (lead) => {
          const aiResult = await scoreLeadWithAI({
            lead,
            criteria,
            userId,
          });

          if (!aiResult) {
            return {
              ok: false,
              leadId: lead.id,
            } as const;
          }

          const result: PrioritizedLead = {
            leadId: lead.id,
            score: aiResult.score,
            label: aiResult.label,
            explanation: aiResult.explanation,
          };

          return {
            ok: true,
            result,
          } as const;
        }),
      );

      const results = processedResults
        .filter(
          (item): item is { ok: true; result: PrioritizedLead } => item.ok,
        )
        .map((item) => item.result);

      const failedLeadIds = processedResults
        .filter((item): item is { ok: false; leadId: string } => !item.ok)
        .map((item) => item.leadId);

      return NextResponse.json(
        {
          processed: leadsToProcess.length,
          succeeded: results.length,
          failed: failedLeadIds.length,
          results,
          failedLeadIds,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error al priorizar leads con IA:", error);

      const message = error instanceof Error ? error.message : "Unknown error";
      if (message === "Organización no encontrada") {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      return NextResponse.json(
        {
          error: "No se pudo ejecutar la priorización de leads con IA",
          details: process.env.NODE_ENV === "development" ? message : undefined,
        },
        { status: 500 },
      );
    }
  }
}
