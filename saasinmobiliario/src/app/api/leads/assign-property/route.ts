import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/src/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "No hay organización activa" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { leadId, propertyId } = body as {
      leadId: string;
      propertyId: string | null;
    };

    if (!leadId) {
      return NextResponse.json(
        { error: "leadId es requerido" },
        { status: 400 },
      );
    }

    const organization = await prisma.organizations.findUnique({
      where: { clerk_org_id: orgId },
      select: { id: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organización no encontrada" },
        { status: 404 },
      );
    }

    // Verificar que el lead pertenece a la organización
    const lead = await prisma.leads.findFirst({
      where: { id: leadId, organization_id: organization.id },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead no encontrado en esta organización" },
        { status: 404 },
      );
    }

    // Si se asigna una propiedad, verificar que pertenece a la misma organización
    if (propertyId) {
      const property = await prisma.properties.findFirst({
        where: { id: propertyId, organization_id: organization.id },
      });

      if (!property) {
        return NextResponse.json(
          { error: "Propiedad no encontrada en esta organización" },
          { status: 404 },
        );
      }
    }

    const updatedLead = await prisma.leads.update({
      where: { id: leadId },
      data: { property_id: propertyId ?? null },
      include: {
        property: {
          select: { id: true, title: true, type: true, location: true },
        },
      },
    });

    return NextResponse.json(
      {
        ...updatedLead,
        budget: updatedLead.budget ? Number(updatedLead.budget) : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error assigning property to lead:", error);
    return NextResponse.json(
      { error: "No se pudo asignar la propiedad al lead" },
      { status: 500 },
    );
  }
}
