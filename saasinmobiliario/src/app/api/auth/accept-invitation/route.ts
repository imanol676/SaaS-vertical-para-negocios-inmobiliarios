import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@/src/lib/clerck";
import { InvitationService } from "@/src/lib/servieces/invitation.serviece";
import prisma from "@/src/lib/prisma";

/**
 * Endpoint para completar el onboarding de un agente invitado.
 * Se llama cuando un usuario nuevo acepta una invitación de Clerk
 * y necesita registrarse en la BD como agente.
 */
export async function POST() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "No se encontró email del usuario" },
        { status: 400 },
      );
    }

    // Buscar la organización en la BD
    const organization = await prisma.organizations.findUnique({
      where: { clerk_org_id: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organización no encontrada" },
        { status: 404 },
      );
    }

    // Verificar si ya existe el usuario
    const existingUser = await prisma.users.findUnique({
      where: { clerk_user_id: userId },
    });

    if (existingUser) {
      return NextResponse.json({ role: existingUser.role });
    }

    // Buscar invitación pendiente
    const invitation = await InvitationService.findPendingByEmail(email);
    const role = invitation ? "agent" : "admin";

    // Crear usuario en la BD
    await prisma.users.create({
      data: {
        clerk_user_id: userId,
        organization_id: organization.id,
        role,
        email,
        name:
          `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
          null,
      },
    });

    // Marcar invitación como aceptada
    if (invitation) {
      await InvitationService.acceptInvitation(email, organization.id);
    }

    // Actualizar metadata de Clerk
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        organizationId: organization.id,
        role,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ role });
  } catch (error) {
    console.error("Error en onboarding de agente:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
