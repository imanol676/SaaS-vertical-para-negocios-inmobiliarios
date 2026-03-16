import { OrganizationController } from "@/src/lib/controllers/organization.controller";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  const response = await OrganizationController.updateOrganization(req);
  return response;
}

export async function PATCH(req: NextRequest) {
  const response = await OrganizationController.updateOrganization(req);
  return response;
}
