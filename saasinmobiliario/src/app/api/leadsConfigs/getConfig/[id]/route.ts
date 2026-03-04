import { NextRequest } from "next/server";
import { LeadsConfigController } from "@/src/lib/controllers/leadsConfig.controller";

export async function GET(req: NextRequest) {
  return await LeadsConfigController.getConfig(req);
}
