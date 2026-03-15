import { NextRequest } from "next/server";
import { LeadsConfigController } from "@/src/lib/controllers/leadsConfig.controller";

export async function POST(req: NextRequest) {
  return await LeadsConfigController.createOrUpdate(req);
}
