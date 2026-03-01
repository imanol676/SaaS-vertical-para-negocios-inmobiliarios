import { PropertyController } from "@/src/lib/controllers/property.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return await PropertyController.createProperty(req);
}
