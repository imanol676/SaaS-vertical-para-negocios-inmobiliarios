import { OrganizationController } from "@/src/lib/controllers/organization.controller";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const response = await OrganizationController.updateOrganizationPlan(req);
  return NextResponse.json(response);
}
