import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/src/lib/prisma";
import {
  checkPlanLimit,
  PlanLimitError,
} from "@/src/lib/billing/checkLimits";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "No hay organización activa en Clerk." },
        { status: 400 },
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      budget,
      zone,
      timeframe,
      property_type,
      source,
      status,
    } = body ?? {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre del lead es requerido." },
        { status: 400 },
      );
    }

    const org = await prisma.organizations.findUnique({
      where: { clerk_org_id: orgId },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organización no encontrada." },
        { status: 404 },
      );
    }

    // Verificar límites del plan y acceso de la organización
    await checkPlanLimit(org.id, "leads");

    const lead = await prisma.leads.create({
      data: {
        organization_id: org.id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        budget: budget ? Number(budget) : null,
        zone: zone?.trim() || null,
        timeframe: timeframe?.trim() || null,
        property_type: property_type?.trim() || null,
        source: source?.trim() || "manual",
        status: status?.trim() || "new",
        raw_payload: body,
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    if (error instanceof PlanLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Error creating lead manually:", error);
    return NextResponse.json(
      { error: "Error interno al crear el lead." },
      { status: 500 },
    );
  }
}
