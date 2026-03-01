import { PropertyController } from "@/src/lib/controllers/property.controller";

export async function GET() {
  return PropertyController.listProperties();
}
