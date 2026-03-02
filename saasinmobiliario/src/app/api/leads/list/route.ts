import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
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

    const leads = await prisma.leads.findMany({
      where: { organization_id: organization.id },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(
      {
        leads: leads.map((lead) => ({
          ...lead,
          budget: lead.budget ? Number(lead.budget) : null,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error listing leads:", error);
    return NextResponse.json(
      { error: "No se pudieron listar los leads" },
      { status: 500 },
    );
  }
}
