import { OrganizationController } from "@/src/lib/controllers/organization.controller";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  const response = await OrganizationController.deleteOrganization(req);
  return response;
}
