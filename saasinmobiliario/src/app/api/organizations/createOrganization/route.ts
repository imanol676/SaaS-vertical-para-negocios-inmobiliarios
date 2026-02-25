import { OrganizationController } from "@/src/lib/controllers/organization.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return await OrganizationController.createOrganization(req);
}
