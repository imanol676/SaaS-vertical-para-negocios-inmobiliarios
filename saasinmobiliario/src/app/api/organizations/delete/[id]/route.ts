import { OrganizationController } from "@/src/lib/controllers/organization.controller";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const response = await OrganizationController.deleteOrganization(req);
  return response;
}
