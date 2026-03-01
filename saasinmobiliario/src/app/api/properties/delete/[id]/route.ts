import { PropertyController } from "@/src/lib/controllers/property.controller";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return PropertyController.deleteProperty(id);
}
