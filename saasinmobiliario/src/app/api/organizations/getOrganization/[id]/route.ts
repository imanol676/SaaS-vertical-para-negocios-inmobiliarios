import { OrganizationController } from "@/src/lib/controllers/organization.controller";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const response = await OrganizationController.getOrganization(req);
  return NextResponse.json(response);
}
