import { OrganizationController } from "@/src/lib/controllers/organization.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = await OrganizationController.addUserToOrganization(req);
  return response;
}
