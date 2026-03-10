import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { InvitationService } from "../servieces/invitation.serviece";
import { ServiceError } from "../servieces/organization.serviece";
import prisma from "../prisma";

export class InvitationController {
  /**
   * Crear invitación: solo admins pueden invitar
   */
  static async createInvitation(req: NextRequest) {
    try {
      const { userId, orgId } = await auth();

      if (!userId || !orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verificar que el usuario sea admin
      const user = await prisma.users.findUnique({
        where: { clerk_user_id: userId },
      });

      if (!user || user.role !== "admin") {
        return NextResponse.json(
          { error: "Solo los administradores pueden invitar usuarios" },
          { status: 403 },
        );
      }

      const body = await req.json();
      const { email } = body;

      if (!email || typeof email !== "string") {
        return NextResponse.json(
          { error: "Email es requerido" },
          { status: 400 },
        );
      }

      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Formato de email inválido" },
          { status: 400 },
        );
      }

      const organization = await prisma.organizations.findUnique({
        where: { clerk_org_id: orgId },
      });

      if (!organization) {
        return NextResponse.json(
          { error: "Organización no encontrada" },
          { status: 404 },
        );
      }

      const invitation = await InvitationService.createInvitation({
        email: email.toLowerCase().trim(),
        organizationId: organization.id,
        clerkOrgId: orgId,
        invitedBy: userId,
      });

      return NextResponse.json(invitation, { status: 201 });
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status },
        );
      }
      console.error("Error creating invitation:", error);
      return NextResponse.json(
        { error: "Error al crear invitación" },
        { status: 500 },
      );
    }
  }

  /**
   * Listar invitaciones de la organización
   */
  static async listInvitations() {
    try {
      const { userId, orgId } = await auth();

      if (!userId || !orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const organization = await prisma.organizations.findUnique({
        where: { clerk_org_id: orgId },
      });

      if (!organization) {
        return NextResponse.json(
          { error: "Organización no encontrada" },
          { status: 404 },
        );
      }

      const invitations = await InvitationService.listInvitations(
        organization.id,
      );

      return NextResponse.json({ invitations });
    } catch (error) {
      console.error("Error listing invitations:", error);
      return NextResponse.json(
        { error: "Error al listar invitaciones" },
        { status: 500 },
      );
    }
  }

  /**
   * Revocar una invitación
   */
  static async revokeInvitation(req: NextRequest) {
    try {
      const { userId, orgId } = await auth();

      if (!userId || !orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const user = await prisma.users.findUnique({
        where: { clerk_user_id: userId },
      });

      if (!user || user.role !== "admin") {
        return NextResponse.json(
          { error: "Solo los administradores pueden revocar invitaciones" },
          { status: 403 },
        );
      }

      const body = await req.json();
      const { invitationId } = body;

      if (!invitationId) {
        return NextResponse.json(
          { error: "ID de invitación requerido" },
          { status: 400 },
        );
      }

      const invitation = await InvitationService.revokeInvitation(
        invitationId,
        orgId,
      );

      return NextResponse.json(invitation);
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status },
        );
      }
      console.error("Error revoking invitation:", error);
      return NextResponse.json(
        { error: "Error al revocar invitación" },
        { status: 500 },
      );
    }
  }

  /**
   * Listar usuarios de la organización con info de Clerk
   */
  static async listUsers() {
    try {
      const { userId, orgId } = await auth();

      if (!userId || !orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const organization = await prisma.organizations.findUnique({
        where: { clerk_org_id: orgId },
        include: { users: true },
      });

      if (!organization) {
        return NextResponse.json(
          { error: "Organización no encontrada" },
          { status: 404 },
        );
      }

      return NextResponse.json({ users: organization.users });
    } catch (error) {
      console.error("Error listing users:", error);
      return NextResponse.json(
        { error: "Error al listar usuarios" },
        { status: 500 },
      );
    }
  }
}
