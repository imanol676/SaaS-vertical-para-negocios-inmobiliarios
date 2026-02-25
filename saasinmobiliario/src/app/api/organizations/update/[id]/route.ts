import { OrganizationController } from "@/src/lib/controllers/organization.controller";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const response = await OrganizationController.updateOrganization(req);
  return response;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const response = await OrganizationController.updateOrganization(req);
  return response;
}
