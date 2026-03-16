import { OrganizationController } from "@/src/lib/controllers/organization.controller";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const response = await OrganizationController.listOrganizations(req);
  return response;
}
