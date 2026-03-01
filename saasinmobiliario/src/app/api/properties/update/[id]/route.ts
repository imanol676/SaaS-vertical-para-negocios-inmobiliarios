import { PropertyController } from "@/src/lib/controllers/property.controller";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return PropertyController.updateProperty(req, id);
}
