import { PropertyController } from "@/src/lib/controllers/property.controller";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return PropertyController.getPropertyById(id);
}
