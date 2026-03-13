import { NextResponse } from "next/server";
import {
  importLeads,
  ImportLeadsError,
} from "@/src/lib/servieces/importLeadsFromSheets";
import { auth } from "@clerk/nextjs/server";
import { checkPlanLimit, PlanLimitError } from "@/src/lib/billing/checkLimits";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
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

    const body = await req.json();
    const { spreadsheetId, range, source, defaultStatus } = body ?? {};

    if (!spreadsheetId || typeof spreadsheetId !== "string") {
      return NextResponse.json(
        { error: "spreadsheetId es requerido" },
        { status: 400 },
      );
    }

    const org = await prisma.organizations.findUnique({
      where: { clerk_org_id: orgId },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organización no encontrada" },
        { status: 404 },
      );
    }

    // Verificar el acceso a la organización y límites antes de intentar la importación
    await checkPlanLimit(org.id, "leads");

    const result = await importLeads({
      spreadsheetId,
      organizationClerkId: orgId,
      range: typeof range === "string" ? range : undefined,
      source: typeof source === "string" ? source : undefined,
      defaultStatus:
        typeof defaultStatus === "string" ? defaultStatus : undefined,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error importing leads from Google Sheets:", error);

    if (error instanceof ImportLeadsError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: error.status },
      );
    }

    if (error instanceof PlanLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Organización no encontrada") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "No se pudieron importar los leads",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
