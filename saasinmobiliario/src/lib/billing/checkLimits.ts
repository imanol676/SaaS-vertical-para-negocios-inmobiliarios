import prisma from "../prisma";
import { getPlanLimits } from "./plans";

type ResourceType = "leads" | "properties" | "users" | "aiScorings";

export class PlanLimitError extends Error {
  status: number;

  constructor(message: string, status: number = 403) {
    super(message);
    this.name = "PlanLimitError";
    this.status = status;
  }
}

/**
 * Verifica que la organización tenga acceso activo (trial vigente o suscripción activa).
 * Lanza PlanLimitError si el acceso no es válido.
 */
export async function checkOrgAccess(organizationId: string) {
  const org = await prisma.organizations.findUnique({
    where: { id: organizationId },
    include: {
      subscription: { select: { status: true } },
    },
  });

  if (!org) throw new PlanLimitError("Organización no encontrada", 404);

  const hasActiveSubscription = org.subscription?.status === "authorized";

  // Si tiene suscripción activa, siempre tiene acceso
  if (hasActiveSubscription) return;

  // Si está en trial, verificar que no haya expirado
  if (org.plan_status === "trial") {
    if (org.trial_ends_at && new Date(org.trial_ends_at) < new Date()) {
      throw new PlanLimitError(
        "Tu período de prueba ha expirado. Suscribite a un plan para continuar usando EstateOS.",
        403,
      );
    }
    // Trial vigente — permitir acceso
    return;
  }

  // Si está cancelado
  if (org.plan_status === "cancelled") {
    throw new PlanLimitError(
      "Tu suscripción fue cancelada. Reactivá tu plan para continuar.",
      403,
    );
  }

  // Si no tiene suscripción ni trial vigente (estado "pending", etc.)
  if (org.plan_status !== "active") {
    throw new PlanLimitError(
      "No tenés una suscripción activa. Elegí un plan para continuar.",
      403,
    );
  }
}

/**
 * Verifica si la organización puede crear más recursos según su plan.
 * También verifica que el acceso de la organización sea válido (trial/suscripción).
 * Lanza PlanLimitError si se excedió el límite o no tiene acceso.
 */
export async function checkPlanLimit(
  organizationId: string,
  resource: ResourceType,
) {
  // Primero verificar acceso general
  await checkOrgAccess(organizationId);

  const org = await prisma.organizations.findUnique({
    where: { id: organizationId },
    include: {
      _count: {
        select: {
          leads: true,
          properties: true,
          users: true,
        },
      },
    },
  });

  if (!org) throw new PlanLimitError("Organización no encontrada", 404);

  const limits = getPlanLimits(org.plan);
  const countMap: Record<ResourceType, number> = {
    leads: org._count.leads,
    properties: org._count.properties,
    users: org._count.users,
    aiScorings: 0, // Se calcula con lead_scores del mes actual
  };

  // Para AI scorings, contar los del mes actual
  if (resource === "aiScorings") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    countMap.aiScorings = await prisma.leadScores.count({
      where: {
        lead: { organization_id: organizationId },
        created_at: { gte: startOfMonth },
      },
    });
  }

  const limitMap: Record<ResourceType, number> = {
    leads: limits.maxLeads,
    properties: limits.maxProperties,
    users: limits.maxUsers,
    aiScorings: limits.maxAiScorings,
  };

  const current = countMap[resource];
  const max = limitMap[resource];

  if (current >= max) {
    const resourceNames: Record<ResourceType, string> = {
      leads: "leads",
      properties: "propiedades",
      users: "usuarios",
      aiScorings: "scorings de IA",
    };

    throw new PlanLimitError(
      `Límite de ${resourceNames[resource]} alcanzado (${current}/${max}). Actualizá tu plan para continuar.`,
    );
  }
}
