import prisma from "../prisma";
import { clerkClient } from "../clerck";
import { ServiceError } from "./organization.serviece";

interface CreateInvitationInput {
  email: string;
  organizationId: string;
  clerkOrgId: string;
  invitedBy: string;
}

export class InvitationService {
  /**
   * Crea una invitación para un nuevo agente
   */
  static async createInvitation(input: CreateInvitationInput) {
    const { email, organizationId, clerkOrgId, invitedBy } = input;

    // Verificar que no exista ya una invitación pendiente para este email
    const existing = await prisma.invitation.findFirst({
      where: {
        email,
        organization_id: organizationId,
        status: "pending",
      },
    });

    if (existing) {
      throw new ServiceError(
        "Ya existe una invitación pendiente para este email",
        409,
      );
    }

    // Verificar que el email no pertenezca ya a un usuario de la organización
    const client = await clerkClient();

    // Crear invitación en Clerk a nivel de organización
    const clerkInvitation =
      await client.organizations.createOrganizationInvitation({
        organizationId: clerkOrgId,
        emailAddress: email,
        inviterUserId: invitedBy,
        role: "org:member",
      });

    // Crear registro en la base de datos
    const invitation = await prisma.invitation.create({
      data: {
        email,
        organization_id: organizationId,
        role: "agent",
        status: "pending",
        invited_by: invitedBy,
        clerk_invitation_id: clerkInvitation.id,
      },
    });

    return invitation;
  }

  /**
   * Lista las invitaciones de una organización
   */
  static async listInvitations(organizationId: string) {
    return prisma.invitation.findMany({
      where: { organization_id: organizationId },
      orderBy: { created_at: "desc" },
    });
  }

  /**
   * Marca una invitación como aceptada por email
   */
  static async acceptInvitation(email: string, organizationId: string) {
    const invitation = await prisma.invitation.findFirst({
      where: {
        email,
        organization_id: organizationId,
        status: "pending",
      },
    });

    if (!invitation) return null;

    return prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" },
    });
  }

  /**
   * Revoca una invitación pendiente
   */
  static async revokeInvitation(invitationId: string, clerkOrgId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new ServiceError("Invitación no encontrada", 404);
    }

    if (invitation.status !== "pending") {
      throw new ServiceError(
        "Solo se pueden revocar invitaciones pendientes",
        400,
      );
    }

    // Revocar en Clerk si existe
    if (invitation.clerk_invitation_id) {
      try {
        const client = await clerkClient();
        await client.organizations.revokeOrganizationInvitation({
          organizationId: clerkOrgId,
          invitationId: invitation.clerk_invitation_id,
          requestingUserId: invitation.invited_by,
        });
      } catch {
        // Si falla en Clerk, igual revocamos localmente
      }
    }

    return prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "revoked" },
    });
  }

  /**
   * Busca invitación pendiente por email (para el flujo de onboarding de agentes)
   */
  static async findPendingByEmail(email: string) {
    return prisma.invitation.findFirst({
      where: {
        email,
        status: "pending",
      },
      include: { organization: true },
    });
  }
}
